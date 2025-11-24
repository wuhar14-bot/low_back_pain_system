using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using LowBackPain.Entities;
using Microsoft.Extensions.Configuration;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Content;
using Volo.Abp.Domain.Repositories;

namespace LowBackPain.PatientImages;

/// <summary>
/// Patient Image Application Service
/// 患者图像应用服务实现
/// </summary>
public class PatientImageAppService : ApplicationService, IPatientImageAppService
{
    private readonly IRepository<PatientImage, Guid> _imageRepository;
    private readonly IRepository<Patient, Guid> _patientRepository;
    private readonly IConfiguration _configuration;
    private readonly string _uploadBasePath;

    // Allowed file types
    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".dicom", ".dcm" };
    private static readonly string[] AllowedMimeTypes = {
        "image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp",
        "application/dicom", "application/octet-stream"
    };
    private const long MaxFileSize = 50 * 1024 * 1024; // 50MB

    public PatientImageAppService(
        IRepository<PatientImage, Guid> imageRepository,
        IRepository<Patient, Guid> patientRepository,
        IConfiguration configuration)
    {
        _imageRepository = imageRepository;
        _patientRepository = patientRepository;
        _configuration = configuration;

        // Get upload path from config or use default
        _uploadBasePath = _configuration["App:UploadPath"]
            ?? Path.Combine(AppContext.BaseDirectory, "uploads");
    }

    /// <summary>
    /// Upload an image for a patient
    /// </summary>
    public async Task<PatientImageDto> UploadAsync(
        Guid patientId,
        IRemoteStreamContent file,
        string imageType,
        string description = null)
    {
        // Validate patient exists
        var patient = await _patientRepository.GetAsync(patientId);
        if (patient == null)
        {
            throw new BusinessException("PATIENT_NOT_FOUND")
                .WithData("patientId", patientId);
        }

        // Validate file
        if (file == null || file.ContentLength == 0)
        {
            throw new BusinessException("FILE_EMPTY");
        }

        if (file.ContentLength > MaxFileSize)
        {
            throw new BusinessException("FILE_TOO_LARGE")
                .WithData("maxSize", "50MB");
        }

        // Validate file extension
        var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();
        if (string.IsNullOrEmpty(extension) || !AllowedExtensions.Contains(extension))
        {
            throw new BusinessException("INVALID_FILE_TYPE")
                .WithData("allowedTypes", string.Join(", ", AllowedExtensions));
        }

        // Validate image type
        var validImageTypes = new[] { "xray", "mri", "photo", "posture", "other" };
        if (!validImageTypes.Contains(imageType.ToLowerInvariant()))
        {
            throw new BusinessException("INVALID_IMAGE_TYPE")
                .WithData("allowedTypes", string.Join(", ", validImageTypes));
        }

        // Create upload directory
        var uploadPath = Path.Combine(_uploadBasePath, "patient-images", patientId.ToString());
        Directory.CreateDirectory(uploadPath);

        // Generate unique filename
        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadPath, fileName);
        var relativePath = Path.Combine("patient-images", patientId.ToString(), fileName);

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.GetStream().CopyToAsync(stream);
        }

        // Create database record
        var patientImage = new PatientImage(
            GuidGenerator.Create(),
            patientId,
            imageType.ToLowerInvariant(),
            file.FileName,
            relativePath,
            file.ContentType ?? "application/octet-stream",
            file.ContentLength ?? 0,
            description);

        await _imageRepository.InsertAsync(patientImage);

        return MapToDto(patientImage);
    }

    /// <summary>
    /// Get all images for a patient
    /// </summary>
    public async Task<List<PatientImageDto>> GetListByPatientAsync(Guid patientId)
    {
        var images = await _imageRepository.GetListAsync(x => x.PatientId == patientId);
        return images.Select(MapToDto).OrderByDescending(x => x.UploadedAt).ToList();
    }

    /// <summary>
    /// Get a single image by ID
    /// </summary>
    public async Task<PatientImageDto> GetAsync(Guid id)
    {
        var image = await _imageRepository.GetAsync(id);
        return MapToDto(image);
    }

    /// <summary>
    /// Download image file
    /// </summary>
    public async Task<IRemoteStreamContent> DownloadAsync(Guid id)
    {
        var image = await _imageRepository.GetAsync(id);
        var filePath = Path.Combine(_uploadBasePath, image.FilePath);

        if (!File.Exists(filePath))
        {
            throw new BusinessException("FILE_NOT_FOUND");
        }

        var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
        return new RemoteStreamContent(stream, image.FileName, image.MimeType);
    }

    /// <summary>
    /// Delete an image
    /// </summary>
    public async Task DeleteAsync(Guid id)
    {
        var image = await _imageRepository.GetAsync(id);

        // Delete file from disk
        var filePath = Path.Combine(_uploadBasePath, image.FilePath);
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        // Delete database record
        await _imageRepository.DeleteAsync(id);
    }

    /// <summary>
    /// Update image description
    /// </summary>
    public async Task<PatientImageDto> UpdateDescriptionAsync(Guid id, string description)
    {
        var image = await _imageRepository.GetAsync(id);
        image.UpdateDescription(description);
        await _imageRepository.UpdateAsync(image);
        return MapToDto(image);
    }

    /// <summary>
    /// Map entity to DTO
    /// </summary>
    private PatientImageDto MapToDto(PatientImage image)
    {
        return new PatientImageDto
        {
            Id = image.Id,
            PatientId = image.PatientId,
            ImageType = image.ImageType,
            FileName = image.FileName,
            FilePath = image.FilePath,
            MimeType = image.MimeType,
            FileSize = image.FileSize,
            Description = image.Description,
            UploadedAt = image.UploadedAt,
            Url = $"/api/app/patient-image/{image.Id}/download"
        };
    }
}
