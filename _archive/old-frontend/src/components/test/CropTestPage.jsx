import React, { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// React Easy Crop
import EasyCropper from 'react-easy-crop'

// React Image Crop
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

const CropTestPage = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [imageUrl, setImageUrl] = useState('')

  // React Easy Crop states
  const [easyCrop, setEasyCrop] = useState({ x: 0, y: 0 })
  const [easyZoom, setEasyZoom] = useState(1)
  const [easyCroppedArea, setEasyCroppedArea] = useState(null)

  // React Image Crop states
  const [reactCrop, setReactCrop] = useState({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  })
  const [completedCrop, setCompletedCrop] = useState(null)
  const reactCropRef = useRef(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setImageUrl(url)

      // Reset crops when new file is selected
      setEasyCrop({ x: 0, y: 0 })
      setEasyZoom(1)
      setReactCrop({
        unit: '%',
        width: 50,
        height: 50,
        x: 25,
        y: 25,
      })
    }
  }

  // React Easy Crop callbacks
  const onEasyCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setEasyCroppedArea(croppedAreaPixels)
  }, [])

  // React Image Crop callbacks
  const onReactCropComplete = (crop) => {
    setCompletedCrop(crop)
  }

  // Cleanup function
  React.useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [imageUrl])

  const getCroppedImage = async (libraryType) => {
    switch (libraryType) {
      case 'easy-crop':
        if (easyCroppedArea && imageUrl) {
          // Create canvas and get cropped image
          const image = new Image()
          image.src = imageUrl
          await new Promise(resolve => {
            image.onload = resolve
          })

          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          canvas.width = easyCroppedArea.width
          canvas.height = easyCroppedArea.height

          ctx.drawImage(
            image,
            easyCroppedArea.x,
            easyCroppedArea.y,
            easyCroppedArea.width,
            easyCroppedArea.height,
            0,
            0,
            easyCroppedArea.width,
            easyCroppedArea.height
          )

          return canvas.toDataURL('image/jpeg')
        }
        break

      case 'react-crop':
        if (completedCrop && reactCropRef.current) {
          const image = reactCropRef.current
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          const scaleX = image.naturalWidth / image.width
          const scaleY = image.naturalHeight / image.height

          canvas.width = completedCrop.width * scaleX
          canvas.height = completedCrop.height * scaleY

          ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
          )

          return canvas.toDataURL('image/jpeg')
        }
        break
    }
    return null
  }

  const testCrop = async (libraryType) => {
    const croppedImage = await getCroppedImage(libraryType)
    if (croppedImage) {
      // Create a new window to display the cropped image
      const newWindow = window.open()
      newWindow.document.write(`
        <html>
          <head><title>Cropped Image - ${libraryType}</title></head>
          <body style="margin:0;padding:20px;text-align:center;">
            <h2>Cropped Image - ${libraryType}</h2>
            <img src="${croppedImage}" style="max-width:100%;height:auto;border:1px solid #ccc;" />
          </body>
        </html>
      `)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Image Cropping Libraries Comparison</h1>
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="mb-2"
          />
          {selectedFile && (
            <p className="text-sm text-gray-600">
              Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
            </p>
          )}
        </div>
      </div>

      {imageUrl && (
        <Tabs defaultValue="easy-crop" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="easy-crop">React Easy Crop</TabsTrigger>
            <TabsTrigger value="react-crop">React Image Crop</TabsTrigger>
          </TabsList>

          <TabsContent value="easy-crop" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>React Easy Crop</CardTitle>
                <CardDescription>
                  Touch-friendly, responsive cropper with zoom support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-96 bg-gray-100 mb-4">
                  <EasyCropper
                    image={imageUrl}
                    crop={easyCrop}
                    zoom={easyZoom}
                    aspect={null}
                    onCropChange={setEasyCrop}
                    onZoomChange={setEasyZoom}
                    onCropComplete={onEasyCropComplete}
                    style={{
                      containerStyle: {
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                      }
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => testCrop('easy-crop')}>
                    Test Crop
                  </Button>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Zoom:</label>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.1}
                      value={easyZoom}
                      onChange={(e) => setEasyZoom(Number(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-sm">{easyZoom.toFixed(1)}x</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="react-crop" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>React Image Crop</CardTitle>
                <CardDescription>
                  Lightweight, customizable crop selection tool
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <ReactCrop
                    crop={reactCrop}
                    onChange={(c) => setReactCrop(c)}
                    onComplete={onReactCropComplete}
                    aspect={undefined}
                  >
                    <img
                      ref={reactCropRef}
                      src={imageUrl}
                      alt="Crop preview"
                      style={{ maxHeight: '400px', maxWidth: '100%' }}
                    />
                  </ReactCrop>
                </div>
                <Button onClick={() => testCrop('react-crop')}>
                  Test Crop
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!imageUrl && (
        <div className="text-center py-12 text-gray-500">
          <p>Select an image file to start testing the cropping libraries</p>
        </div>
      )}
    </div>
  )
}

export default CropTestPage