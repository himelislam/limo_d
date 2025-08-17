import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Save, Building2, DollarSign, Clock, Palette, Globe, Users, Car } from 'lucide-react';
import { getMyBusiness, updateBusiness } from '@/api/business';

export default function BusinessSettings() {
  const [settings, setSettings] = useState({
    // Basic Info
    name: '',
    email: '',
    phone: '',
    businessType: '',
    licenseNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    
    // Pricing
    baseFare: '',
    perKmRate: '',
    perMinuteRate: '',
    
    // Operating Hours
    operatingHours: {
      start: '',
      end: '',
    },
    
    // Business Settings
    settings: {
      maxDrivers: 50,
      maxVehicles: 50,
      allowPublicBooking: true,
      autoAssignDrivers: false,
      bookingWidget: {
        enabled: true,
        customization: {
          primaryColor: '#3B82F6',
          companyLogo: '',
          welcomeMessage: 'Book your ride with us! Safe, reliable, and affordable transportation.',
          buttonText: 'Book Now',
          showCompanyInfo: true,
          requirePhone: true,
          allowNotes: true
        }
      }
    },
    
    // Subscription
    subscription: {
      plan: 'basic',
      isActive: true
    },
    
    // Status
    status: 'active'
  });

  const queryClient = useQueryClient();

  const { data: businessRes, isLoading } = useQuery({
    queryKey: ['my-business'],
    queryFn: getMyBusiness,
  });

  // Update settings when business data is loaded
  useEffect(() => {
    if (businessRes?.data) {
      const business = businessRes.data;
      setSettings({
        name: business.name || '',
        email: business.email || '',
        phone: business.phone || '',
        businessType: business.businessType || '',
        licenseNumber: business.licenseNumber || '',
        address: {
          street: business.address?.street || '',
          city: business.address?.city || '',
          state: business.address?.state || '',
          zipCode: business.address?.zipCode || '',
          country: business.address?.country || 'India'
        },
        baseFare: business.baseFare?.toString() || '',
        perKmRate: business.perKmRate?.toString() || '',
        perMinuteRate: business.perMinuteRate?.toString() || '',
        operatingHours: {
          start: business.operatingHours?.start || '',
          end: business.operatingHours?.end || '',
        },
        settings: {
          maxDrivers: business.settings?.maxDrivers || 50,
          maxVehicles: business.settings?.maxVehicles || 50,
          allowPublicBooking: business.settings?.allowPublicBooking ?? true,
          autoAssignDrivers: business.settings?.autoAssignDrivers ?? false,
          bookingWidget: {
            enabled: business.settings?.bookingWidget?.enabled ?? true,
            customization: {
              primaryColor: business.settings?.bookingWidget?.customization?.primaryColor || '#3B82F6',
              companyLogo: business.settings?.bookingWidget?.customization?.companyLogo || '',
              welcomeMessage: business.settings?.bookingWidget?.customization?.welcomeMessage || 'Book your ride with us!',
              buttonText: business.settings?.bookingWidget?.customization?.buttonText || 'Book Now',
              showCompanyInfo: business.settings?.bookingWidget?.customization?.showCompanyInfo ?? true,
              requirePhone: business.settings?.bookingWidget?.customization?.requirePhone ?? true,
              allowNotes: business.settings?.bookingWidget?.customization?.allowNotes ?? true
            }
          }
        },
        subscription: {
          plan: business.subscription?.plan || 'basic',
          isActive: business.subscription?.isActive ?? true
        },
        status: business.status || 'active'
      });
    }
  }, [businessRes?.data]);

  const updateMutation = useMutation({
    mutationFn: updateBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-business']);
    },
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      ...settings,
      baseFare: parseFloat(settings.baseFare) || 0,
      perKmRate: parseFloat(settings.perKmRate) || 0,
      perMinuteRate: parseFloat(settings.perMinuteRate) || 0,
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
        <p className="text-gray-600">Configure your business preferences and widget customization</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="widget">Widget Design</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSave}>
          <TabsContent value="general" className="space-y-6">
            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Business Information
                </CardTitle>
                <CardDescription>
                  Update your business details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Business Name</Label>
                    <Input
                      id="name"
                      value={settings.name}
                      onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select 
                      value={settings.businessType} 
                      onValueChange={(value) => setSettings({ ...settings, businessType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="taxi">Taxi Service</SelectItem>
                        <SelectItem value="logistics">Logistics</SelectItem>
                        <SelectItem value="tour">Tour & Travel</SelectItem>
                        <SelectItem value="corporate">Corporate Transport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={settings.licenseNumber}
                    onChange={(e) => setSettings({ ...settings, licenseNumber: e.target.value })}
                    required
                  />
                </div>
                
                {/* Address */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Address</Label>
                  <div className="grid gap-4">
                    <Input
                      placeholder="Street Address"
                      value={settings.address.street}
                      onChange={(e) => setSettings({ 
                        ...settings, 
                        address: { ...settings.address, street: e.target.value }
                      })}
                    />
                    <div className="grid gap-4 md:grid-cols-3">
                      <Input
                        placeholder="City"
                        value={settings.address.city}
                        onChange={(e) => setSettings({ 
                          ...settings, 
                          address: { ...settings.address, city: e.target.value }
                        })}
                      />
                      <Input
                        placeholder="State"
                        value={settings.address.state}
                        onChange={(e) => setSettings({ 
                          ...settings, 
                          address: { ...settings.address, state: e.target.value }
                        })}
                      />
                      <Input
                        placeholder="ZIP Code"
                        value={settings.address.zipCode}
                        onChange={(e) => setSettings({ 
                          ...settings, 
                          address: { ...settings.address, zipCode: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            {/* Pricing Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing Settings
                </CardTitle>
                <CardDescription>
                  Configure your fare structure and pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="baseFare">Base Fare ($)</Label>
                    <Input
                      id="baseFare"
                      type="number"
                      step="0.01"
                      value={settings.baseFare}
                      onChange={(e) => setSettings({ ...settings, baseFare: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="perKmRate">Per KM Rate ($)</Label>
                    <Input
                      id="perKmRate"
                      type="number"
                      step="0.01"
                      value={settings.perKmRate}
                      onChange={(e) => setSettings({ ...settings, perKmRate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="perMinuteRate">Per Minute Rate ($)</Label>
                    <Input
                      id="perMinuteRate"
                      type="number"
                      step="0.01"
                      value={settings.perMinuteRate}
                      onChange={(e) => setSettings({ ...settings, perMinuteRate: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            {/* Operating Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Operating Hours
                </CardTitle>
                <CardDescription>
                  Set your business operating hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={settings.operatingHours.start}
                      onChange={(e) => setSettings({
                        ...settings,
                        operatingHours: { ...settings.operatingHours, start: e.target.value }
                      })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={settings.operatingHours.end}
                      onChange={(e) => setSettings({
                        ...settings,
                        operatingHours: { ...settings.operatingHours, end: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Business Preferences
                </CardTitle>
                <CardDescription>
                  Configure operational preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="maxDrivers">Maximum Drivers</Label>
                    <Input
                      id="maxDrivers"
                      type="number"
                      min="1"
                      value={settings.settings.maxDrivers}
                      onChange={(e) => setSettings({
                        ...settings,
                        settings: { ...settings.settings, maxDrivers: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="maxVehicles">Maximum Vehicles</Label>
                    <Input
                      id="maxVehicles"
                      type="number"
                      min="1"
                      value={settings.settings.maxVehicles}
                      onChange={(e) => setSettings({
                        ...settings,
                        settings: { ...settings.settings, maxVehicles: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Public Booking</Label>
                      <p className="text-sm text-gray-600">
                        Allow customers to book through your widget
                      </p>
                    </div>
                    <Switch
                      checked={settings.settings.allowPublicBooking}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        settings: { ...settings.settings, allowPublicBooking: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Assign Drivers</Label>
                      <p className="text-sm text-gray-600">
                        Automatically assign available drivers to new trips
                      </p>
                    </div>
                    <Switch
                      checked={settings.settings.autoAssignDrivers}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        settings: { ...settings.settings, autoAssignDrivers: checked }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="widget" className="space-y-6">
            {/* Widget Design */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Widget Design & Customization
                </CardTitle>
                <CardDescription>
                  Customize the appearance and behavior of your booking widget
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Booking Widget</Label>
                    <p className="text-sm text-gray-600">
                      Allow customers to book through your embedded widget
                    </p>
                  </div>
                  <Switch
                    checked={settings.settings.bookingWidget.enabled}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      settings: {
                        ...settings.settings,
                        bookingWidget: {
                          ...settings.settings.bookingWidget,
                          enabled: checked
                        }
                      }
                    })}
                  />
                </div>

                {settings.settings.bookingWidget.enabled && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={settings.settings.bookingWidget.customization.primaryColor}
                            onChange={(e) => setSettings({
                              ...settings,
                              settings: {
                                ...settings.settings,
                                bookingWidget: {
                                  ...settings.settings.bookingWidget,
                                  customization: {
                                    ...settings.settings.bookingWidget.customization,
                                    primaryColor: e.target.value
                                  }
                                }
                              }
                            })}
                            className="w-16 h-10"
                          />
                          <Input
                            value={settings.settings.bookingWidget.customization.primaryColor}
                            onChange={(e) => setSettings({
                              ...settings,
                              settings: {
                                ...settings.settings,
                                bookingWidget: {
                                  ...settings.settings.bookingWidget,
                                  customization: {
                                    ...settings.settings.bookingWidget.customization,
                                    primaryColor: e.target.value
                                  }
                                }
                              }
                            })}
                            placeholder="#3B82F6"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="buttonText">Button Text</Label>
                        <Input
                          id="buttonText"
                          value={settings.settings.bookingWidget.customization.buttonText}
                          onChange={(e) => setSettings({
                            ...settings,
                            settings: {
                              ...settings.settings,
                              bookingWidget: {
                                ...settings.settings.bookingWidget,
                                customization: {
                                  ...settings.settings.bookingWidget.customization,
                                  buttonText: e.target.value
                                }
                              }
                            }
                          })}
                          placeholder="Book Now"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="welcomeMessage">Welcome Message</Label>
                      <Textarea
                        id="welcomeMessage"
                        value={settings.settings.bookingWidget.customization.welcomeMessage}
                        onChange={(e) => setSettings({
                          ...settings,
                          settings: {
                            ...settings.settings,
                            bookingWidget: {
                              ...settings.settings.bookingWidget,
                              customization: {
                                ...settings.settings.bookingWidget.customization,
                                welcomeMessage: e.target.value
                              }
                            }
                          }
                        })}
                        placeholder="Welcome message for your customers..."
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="companyLogo">Company Logo URL</Label>
                      <Input
                        id="companyLogo"
                        value={settings.settings.bookingWidget.customization.companyLogo}
                        onChange={(e) => setSettings({
                          ...settings,
                          settings: {
                            ...settings.settings,
                            bookingWidget: {
                              ...settings.settings.bookingWidget,
                              customization: {
                                ...settings.settings.bookingWidget.customization,
                                companyLogo: e.target.value
                              }
                            }
                          }
                        })}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Show Company Info</Label>
                          <p className="text-sm text-gray-600">
                            Display company name and logo in widget
                          </p>
                        </div>
                        <Switch
                          checked={settings.settings.bookingWidget.customization.showCompanyInfo}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            settings: {
                              ...settings.settings,
                              bookingWidget: {
                                ...settings.settings.bookingWidget,
                                customization: {
                                  ...settings.settings.bookingWidget.customization,
                                  showCompanyInfo: checked
                                }
                              }
                            }
                          })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Require Phone Number</Label>
                          <p className="text-sm text-gray-600">
                            Make phone number mandatory for bookings
                          </p>
                        </div>
                        <Switch
                          checked={settings.settings.bookingWidget.customization.requirePhone}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            settings: {
                              ...settings.settings,
                              bookingWidget: {
                                ...settings.settings.bookingWidget,
                                customization: {
                                  ...settings.settings.bookingWidget.customization,
                                  requirePhone: checked
                                }
                              }
                            }
                          })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Allow Notes</Label>
                          <p className="text-sm text-gray-600">
                            Allow customers to add notes to their booking
                          </p>
                        </div>
                        <Switch
                          checked={settings.settings.bookingWidget.customization.allowNotes}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            settings: {
                              ...settings.settings,
                              bookingWidget: {
                                ...settings.settings.bookingWidget,
                                customization: {
                                  ...settings.settings.bookingWidget.customization,
                                  allowNotes: checked
                                }
                              }
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            {/* Subscription */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Subscription Plan
                </CardTitle>
                <CardDescription>
                  Manage your subscription and plan details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Current Plan</Label>
                    <div className="p-3 border rounded-lg bg-gray-50">
                      <span className="font-medium capitalize">{settings.subscription.plan}</span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        settings.subscription.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {settings.subscription.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Business Status</Label>
                    <div className="p-3 border rounded-lg bg-gray-50">
                      <span className={`font-medium capitalize ${
                        settings.status === 'active' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {settings.status}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end">
            <Button type="submit" disabled={updateMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}
