import { base44 } from './base44Client';
import { createMockIntegrations } from './mockIntegrations';

// Configuration: Full production mode - all real APIs
const useMockIntegrations = false;
const isDevelopment = false;

// Use all real base44 APIs
const integrations = {
  Core: base44.integrations.Core,
  InvokeLLM: base44.integrations.Core.InvokeLLM,
  SendEmail: base44.integrations.Core.SendEmail,
  UploadFile: base44.integrations.Core.UploadFile,
  GenerateImage: base44.integrations.Core.GenerateImage,
  ExtractDataFromUploadedFile: base44.integrations.Core.ExtractDataFromUploadedFile,
  CreateFileSignedUrl: base44.integrations.Core.CreateFileSignedUrl,
  UploadPrivateFile: base44.integrations.Core.UploadPrivateFile
};

export const Core = integrations.Core;
export const InvokeLLM = integrations.InvokeLLM;
export const SendEmail = integrations.SendEmail;
export const UploadFile = integrations.UploadFile;
export const GenerateImage = integrations.GenerateImage;
export const ExtractDataFromUploadedFile = integrations.ExtractDataFromUploadedFile;
export const CreateFileSignedUrl = integrations.CreateFileSignedUrl;
export const UploadPrivateFile = integrations.UploadPrivateFile;






