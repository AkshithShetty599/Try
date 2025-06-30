
import React, { useState } from 'react';
import { Upload, Heart, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface PredictionResult {
  prediction: 'Heart Risk' | 'No Heart Risk';
  confidence: number;
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

const handlePredict = async () => {
  if (!selectedImage) {
    toast({
      title: "No image selected",
      description: "Please select a retinal image first",
      variant: "destructive",
    });
    return;
  }

  setIsLoading(true);

  try {
    const formData = new FormData();
    formData.append("file", selectedImage);

    const response = await fetch("http://localhost:8000/predict", {
      method: "POST",
      body: formData,
    });

    const text = await response.text(); // Read raw response (even if not JSON)
    console.log("Raw backend response:", text); // ✅ log it

    if (!response.ok) {
      console.error("Server returned non-OK status:", response.status);
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    let data;
    try {
      data = JSON.parse(text); // Try to parse JSON
    } catch (jsonError) {
      console.error("Failed to parse JSON:", jsonError);
      throw new Error("Invalid JSON response from server");
    }

    console.log("Parsed response:", data); // ✅ final data

    const parsedResult: PredictionResult = {
      prediction: data.isRisk ? "Heart Risk" : "No Heart Risk",
      confidence: data.confidence,
    };

    setResult(parsedResult);

    toast({
      title: "Analysis complete",
      description: data.label,
    });
  } catch (error: any) {
    console.error("Prediction Error:", error);

    toast({
      title: "Prediction failed",
      description: error.message || "There was an error processing your image.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-6 shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Heart Risk Prediction from Retinal Images
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Upload a retinal image to check whether the person is at risk of heart disease using AI-powered medical analysis.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Upload className="w-5 h-5" />
                Upload Retinal Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Selected retinal image"
                      className="max-w-full max-h-48 mx-auto rounded-lg shadow-md"
                    />
                    <p className="text-sm text-gray-600">
                      {selectedImage?.name}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-600 font-medium">
                        Drag and drop your retinal image here
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        or click to browse files
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handlePredict}
                disabled={!selectedImage || isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 mr-2" />
                    Predict Heart Risk
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <AlertCircle className="w-5 h-5" />
                Prediction Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                  </div>
                  <p className="text-gray-600 font-medium">Processing your image...</p>
                  <p className="text-sm text-gray-400">This may take a few moments</p>
                </div>
              ) : result ? (
                <div className="space-y-6">
                  <div className={`p-6 rounded-xl ${
                    result.prediction === 'Heart Risk'
                      ? 'bg-red-50 border-2 border-red-200'
                      : 'bg-green-50 border-2 border-green-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      {result.prediction === 'Heart Risk' ? (
                        <AlertCircle className="w-6 h-6 text-red-500" />
                      ) : (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                      <h3 className={`text-xl font-bold ${
                        result.prediction === 'Heart Risk' ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {result.prediction}
                      </h3>
                    </div>
                    <p className={`text-sm ${
                      result.prediction === 'Heart Risk' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {result.prediction === 'Heart Risk'
                        ? 'The analysis suggests potential heart risk indicators in the retinal image.'
                        : 'No significant heart risk indicators were detected in the retinal image.'
                      }
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Confidence Score</span>
                      <span className="text-2xl font-bold text-gray-800">
                        {(result.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          result.confidence > 0.8 ? 'bg-green-500' : 
                          result.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${result.confidence * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500">
                      Higher confidence indicates more reliable prediction
                    </p>
                  </div>

                  {imagePreview && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-600 mb-2">Analyzed Image:</p>
                      <img
                        src={imagePreview}
                        alt="Analyzed retinal image"
                        className="w-full max-w-xs mx-auto rounded-lg shadow-md"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Heart className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">No analysis yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Upload an image and click "Predict" to see results
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer Information */}
        <div className="mt-12 text-center">
          <Card className="backdrop-blur-sm bg-white/60 border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">How it works</h4>
                  <p>AI analyzes retinal blood vessel patterns to detect cardiovascular risk indicators</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Accuracy</h4>
                  <p>Our model achieves high accuracy in detecting heart disease risk from retinal images</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Important Note</h4>
                  <p>This tool is for research purposes only and should not replace professional medical diagnosis</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
