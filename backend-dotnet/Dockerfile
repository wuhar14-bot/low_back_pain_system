# Build stage
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["aspnet-core/LowBackPain.sln", "aspnet-core/"]
COPY ["aspnet-core/src/LowBackPain.Domain.Shared/LowBackPain.Domain.Shared.csproj", "aspnet-core/src/LowBackPain.Domain.Shared/"]
COPY ["aspnet-core/src/LowBackPain.Domain/LowBackPain.Domain.csproj", "aspnet-core/src/LowBackPain.Domain/"]
COPY ["aspnet-core/src/LowBackPain.Application.Contracts/LowBackPain.Application.Contracts.csproj", "aspnet-core/src/LowBackPain.Application.Contracts/"]
COPY ["aspnet-core/src/LowBackPain.Application/LowBackPain.Application.csproj", "aspnet-core/src/LowBackPain.Application/"]
COPY ["aspnet-core/src/LowBackPain.EntityFrameworkCore/LowBackPain.EntityFrameworkCore.csproj", "aspnet-core/src/LowBackPain.EntityFrameworkCore/"]
COPY ["aspnet-core/src/LowBackPain.HttpApi/LowBackPain.HttpApi.csproj", "aspnet-core/src/LowBackPain.HttpApi/"]
COPY ["aspnet-core/src/LowBackPain.HttpApi.Host/LowBackPain.HttpApi.Host.csproj", "aspnet-core/src/LowBackPain.HttpApi.Host/"]

# Restore dependencies
RUN dotnet restore "aspnet-core/LowBackPain.sln"

# Copy everything else
COPY aspnet-core/ aspnet-core/

# Build
WORKDIR /src/aspnet-core/src/LowBackPain.HttpApi.Host
RUN dotnet build "LowBackPain.HttpApi.Host.csproj" -c Release -o /app/build

# Publish
RUN dotnet publish "LowBackPain.HttpApi.Host.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:7.0
WORKDIR /app
COPY --from=build /app/publish .

# Expose port
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "LowBackPain.HttpApi.Host.dll"]
