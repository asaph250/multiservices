
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Settings as SettingsIcon, User, Bell, Globe, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";

const Settings = () => {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const { isDark } = useTheme();
  const { preferences, updatePreferences, loading } = useUserPreferences();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleUpdatePreferences = async (updates: any) => {
    if (!preferences) return;
    
    setSaving(true);
    try {
      await updatePreferences(updates);
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <SettingsIcon className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Settings
              </CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={user?.email || ''} disabled />
                </div>
                <div>
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" value={user?.name || ''} disabled />
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Profile information is managed through your account settings.
              </p>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Appearance
              </CardTitle>
              <CardDescription>Customize how the app looks and feels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark themes</p>
                </div>
                <ThemeToggle />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Language</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred language</p>
                </div>
                <LanguageToggle />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
              <CardDescription>Control how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates</p>
                </div>
                <Switch 
                  checked={preferences?.email_notifications || false}
                  onCheckedChange={(checked) => handleUpdatePreferences({ email_notifications: checked })}
                  disabled={saving}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive SMS updates</p>
                </div>
                <Switch 
                  checked={preferences?.sms_notifications || false}
                  onCheckedChange={(checked) => handleUpdatePreferences({ sms_notifications: checked })}
                  disabled={saving}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive promotional content</p>
                </div>
                <Switch 
                  checked={preferences?.marketing_emails || false}
                  onCheckedChange={(checked) => handleUpdatePreferences({ marketing_emails: checked })}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Regional Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Regional Settings
              </CardTitle>
              <CardDescription>Configure timezone and date formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select 
                  value={preferences?.timezone || 'Africa/Kigali'}
                  onValueChange={(value) => handleUpdatePreferences({ timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Kigali">Africa/Kigali (GMT+2)</SelectItem>
                    <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select 
                  value={preferences?.date_format || 'DD/MM/YYYY'}
                  onValueChange={(value) => handleUpdatePreferences({ date_format: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Account Actions</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={logout}>
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
