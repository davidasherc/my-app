import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Palette, 
  Type, 
  Layout, 
  Smartphone, 
  Save, 
  RotateCcw, 
  Eye,
  Download,
  Upload
} from 'lucide-react';
import { useBranding, brandPresets } from './BrandingProvider';

export function BrandingCustomizer({ onClose }: { onClose?: () => void }) {
  const { config, updateBrand, applyTheme } = useBranding();
  const [previewMode, setPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleConfigChange = (key: string, value: any) => {
    updateBrand({ [key]: value });
    setHasUnsavedChanges(true);
  };

  const handleEmotionColorChange = (emotion: string, color: string) => {
    updateBrand({
      emotionColors: {
        ...config.emotionColors,
        [emotion]: color
      }
    });
    setHasUnsavedChanges(true);
  };

  const exportConfig = () => {
    const configJson = JSON.stringify(config, null, 2);
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.appName.toLowerCase().replace(/\s+/g, '-')}-branding.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedConfig = JSON.parse(e.target?.result as string);
          updateBrand(importedConfig);
          setHasUnsavedChanges(true);
        } catch (error) {
          alert('Invalid configuration file');
        }
      };
      reader.readAsText(file);
    }
  };

  const applyPreset = (presetKey: string) => {
    const preset = brandPresets[presetKey as keyof typeof brandPresets];
    if (preset) {
      updateBrand(preset);
      setHasUnsavedChanges(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Brand Customization
          </h1>
          <p className="text-muted-foreground">
            Customize your app's branding, colors, and visual identity
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          
          {hasUnsavedChanges && (
            <Badge variant="secondary">Unsaved changes</Badge>
          )}
          
          {onClose && (
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          )}
        </div>
      </div>

      {hasUnsavedChanges && (
        <Alert>
          <Save className="h-4 w-4" />
          <AlertDescription>
            Your changes are automatically saved. Refresh the page to see all changes applied.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="emotions">Emotions</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
        </TabsList>

        {/* App Identity */}
        <TabsContent value="identity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>App Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logoHeader">Header/Footer Logo (Horizontal)</Label>
                  <Input
                    id="logoHeader"
                    value={config.logoHeader || ''}
                    onChange={(e) => handleConfigChange('logoHeader', e.target.value)}
                    placeholder="https://yourdomain.com/logo-header.png or /logo-header.png"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used in top navigation and footer. Best as a horizontal logo with text.
                  </p>
                </div>

                {config.logoHeader && (
                  <div className="space-y-2">
                    <Label>Header Logo Preview</Label>
                    <div className="border rounded-lg p-4 bg-white flex items-center gap-3">
                      <img 
                        src={config.logoHeader} 
                        alt="Header logo preview"
                        className="h-8 object-contain"
                      />
                      <span className="text-sm text-gray-500">← As it appears in header</span>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 space-y-2">
                  <Label htmlFor="logoFeature">Loading/Login Logo (Feature)</Label>
                  <Input
                    id="logoFeature"
                    value={config.logoFeature || ''}
                    onChange={(e) => handleConfigChange('logoFeature', e.target.value)}
                    placeholder="https://yourdomain.com/logo-feature.png or /logo-feature.png"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used on loading screens and login/signup pages. Can be square or vertical.
                  </p>
                </div>

                {config.logoFeature && (
                  <div className="space-y-2">
                    <Label>Feature Logo Preview</Label>
                    <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <img 
                        src={config.logoFeature} 
                        alt="Feature logo preview"
                        className="h-20 object-contain"
                      />
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 space-y-2">
                  <Label htmlFor="logoIcon">App Icon (Square)</Label>
                  <Input
                    id="logoIcon"
                    value={config.logoIcon || ''}
                    onChange={(e) => handleConfigChange('logoIcon', e.target.value)}
                    placeholder="https://yourdomain.com/icon-512.png or /icon-512.png"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for app stores, PWA install, and device home screen. Must be square (512x512px recommended).
                  </p>
                </div>

                {config.logoIcon && (
                  <div className="space-y-2">
                    <Label>App Icon Preview</Label>
                    <div className="border rounded-lg p-4 bg-gray-100 flex items-center gap-4">
                      <img 
                        src={config.logoIcon} 
                        alt="App icon preview"
                        className="h-16 w-16 object-contain rounded-xl shadow-md"
                      />
                      <div className="text-xs text-gray-600">
                        <p className="font-medium">As it appears on:</p>
                        <ul className="list-disc ml-4 mt-1">
                          <li>App Store / Play Store</li>
                          <li>Device home screen</li>
                          <li>PWA install prompt</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <Alert>
                  <Upload className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Logo Guidelines:</strong>
                    <div className="mt-2 space-y-2 text-sm">
                      <div>
                        <strong>Header/Footer:</strong> Horizontal logo (e.g., 300x80px). Can include text.
                      </div>
                      <div>
                        <strong>Loading/Login:</strong> Square or vertical (e.g., 512x512px or 400x600px). Your main brand logo.
                      </div>
                      <div>
                        <strong>App Icon:</strong> Must be square (512x512px). Simple icon, no text.
                      </div>
                    </div>
                    <p className="mt-3 text-sm">
                      <strong>Quick Setup:</strong> Place your logo files in the <code className="bg-gray-200 px-1 rounded">/public</code> folder:
                    </p>
                    <ul className="list-disc ml-4 mt-1 text-xs space-y-0.5">
                      <li><code className="bg-gray-200 px-1 rounded">/public/logo-header.png</code></li>
                      <li><code className="bg-gray-200 px-1 rounded">/public/logo-feature.png</code></li>
                      <li><code className="bg-gray-200 px-1 rounded">/public/icon-512.png</code></li>
                    </ul>
                    <p className="mt-2 text-xs">Then use: <code className="bg-gray-200 px-1 rounded">/logo-header.png</code>, <code className="bg-gray-200 px-1 rounded">/logo-feature.png</code>, <code className="bg-gray-200 px-1 rounded">/icon-512.png</code></p>
                  </AlertDescription>
                </Alert>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appName">App Name</Label>
                  <Input
                    id="appName"
                    value={config.appName}
                    onChange={(e) => handleConfigChange('appName', e.target.value)}
                    placeholder="Emotion Journal"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={config.tagline}
                    onChange={(e) => handleConfigChange('tagline', e.target.value)}
                    placeholder="Your wellness journey starts here"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={config.supportEmail}
                    onChange={(e) => handleConfigChange('supportEmail', e.target.value)}
                    placeholder="support@yourapp.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    value={config.website || ''}
                    onChange={(e) => handleConfigChange('website', e.target.value)}
                    placeholder="https://yourapp.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={config.primaryColor}
                      onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                      placeholder="#2563eb"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={config.secondaryColor}
                      onChange={(e) => handleConfigChange('secondaryColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={config.secondaryColor}
                      onChange={(e) => handleConfigChange('secondaryColor', e.target.value)}
                      placeholder="#0d9488"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={config.accentColor}
                      onChange={(e) => handleConfigChange('accentColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={config.accentColor}
                      onChange={(e) => handleConfigChange('accentColor', e.target.value)}
                      placeholder="#f3e8ff"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Theme Presets</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['healthcare', 'therapy', 'wellness', 'startup'] as const).map((theme) => (
                    <Button
                      key={theme}
                      variant={config.theme === theme ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => applyTheme(theme)}
                      className="capitalize"
                    >
                      {theme}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography */}
        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Typography
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select 
                  value={config.fontFamily} 
                  onValueChange={(value) => handleConfigChange('fontFamily', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern (Inter, SF Pro)</SelectItem>
                    <SelectItem value="friendly">Friendly (Poppins, Nunito)</SelectItem>
                    <SelectItem value="professional">Professional (Source Sans Pro)</SelectItem>
                    <SelectItem value="custom">Custom Font</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {config.fontFamily === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="customFontUrl">Custom Font URL</Label>
                  <Input
                    id="customFontUrl"
                    value={config.customFontUrl || ''}
                    onChange={(e) => handleConfigChange('customFontUrl', e.target.value)}
                    placeholder="https://fonts.googleapis.com/css2?family=YourFont"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Border Radius Style</Label>
                <Select 
                  value={config.borderRadius} 
                  onValueChange={(value) => handleConfigChange('borderRadius', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soft">Soft & Friendly</SelectItem>
                    <SelectItem value="sharp">Professional & Sharp</SelectItem>
                    <SelectItem value="organic">Organic & Wellness</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emotion Colors */}
        <TabsContent value="emotions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Emotion Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(config.emotionColors).map(([emotion, color]) => (
                  <div key={emotion} className="space-y-2">
                    <Label className="capitalize">{emotion}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={color}
                        onChange={(e) => handleEmotionColorChange(emotion, e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={color}
                        onChange={(e) => handleEmotionColorChange(emotion, e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Presets */}
        <TabsContent value="presets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Presets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {Object.entries(brandPresets).map(([key, preset]) => (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{preset.appName}</h4>
                      <p className="text-sm text-muted-foreground">{preset.tagline}</p>
                      <div className="flex gap-1 mt-2">
                        <Badge variant="outline" className="text-xs">{preset.theme}</Badge>
                        <Badge variant="outline" className="text-xs">{preset.fontFamily}</Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(key)}
                    >
                      Apply
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium">Import/Export Configuration</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportConfig}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Config
                  </Button>
                  
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".json"
                      onChange={importConfig}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Config
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}