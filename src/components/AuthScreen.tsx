import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Shield, Lock, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { LogoComponent, AuthPageLogo } from './LogoComponent';
import { DisclaimerFooter } from './DisclaimerFooter';

export function AuthScreen() {
  const { login, register, isLoading } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    therapistEmail: '',
    agreeToTerms: false,
    agreeToHipaa: false
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentTab, setCurrentTab] = useState('login');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀🚀🚀 LOGIN BUTTON CLICKED!', { email: loginForm.email, password: '***' });
    setErrors({});

    if (!validateEmail(loginForm.email)) {
      console.log('❌ Email validation failed');
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    if (!loginForm.password) {
      console.log('❌ Password validation failed');
      setErrors({ password: 'Password is required' });
      return;
    }

    console.log('✅ Validation passed, calling login()...');
    const result = await login(loginForm.email, loginForm.password);
    console.log('📥 Login result:', result);
    if (!result.success) {
      setErrors({ submit: result.error || 'Login failed' });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: { [key: string]: string } = {};

    if (!registerForm.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!registerForm.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!validateEmail(registerForm.email)) newErrors.email = 'Please enter a valid email address';
    if (!validatePassword(registerForm.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (registerForm.therapistEmail && !validateEmail(registerForm.therapistEmail)) {
      newErrors.therapistEmail = 'Please enter a valid therapist email address';
    }
    if (!registerForm.agreeToTerms) newErrors.terms = 'You must agree to the Terms of Service';
    if (!registerForm.agreeToHipaa) newErrors.hipaa = 'You must acknowledge the HIPAA Privacy Notice';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await register({
      email: registerForm.email,
      password: registerForm.password,
      firstName: registerForm.firstName,
      lastName: registerForm.lastName,
      therapistEmail: registerForm.therapistEmail || undefined
    });

    if (!result.success) {
      setErrors({ submit: result.error || 'Registration failed' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Main Logo/Brand Header */}
        <div className="text-center space-y-4">
          <AuthPageLogo />
        </div>

        {/* Security Badge */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div className="text-sm text-green-800">
                <div className="font-medium">Secure & Private</div>
                <div className="text-xs text-green-700">End-to-end encrypted, HIPAA compliant</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auth Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Sign Up
            </TabsTrigger>
          </TabsList>

          {/* Login Form */}
          <TabsContent value="login" className="space-y-4">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Welcome back</CardTitle>
                <CardDescription>
                  Sign in to access your emotional wellness journal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className={errors.password ? 'border-red-500' : ''}
                    />
                    {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                  </div>

                  {errors.submit && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.submit}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <div className="text-center text-sm text-gray-600">
                    Demo: Use email "demo@example.com" and password "demo123"
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Register Form */}
          <TabsContent value="register" className="space-y-4">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Create your account</CardTitle>
                <CardDescription>
                  Start your emotional wellness journey with secure, private tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && <p className="text-xs text-red-600">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={registerForm.lastName}
                        onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && <p className="text-xs text-red-600">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="john@example.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a strong password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className={errors.password ? 'border-red-500' : ''}
                    />
                    {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      className={errors.confirmPassword ? 'border-red-500' : ''}
                    />
                    {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="therapistEmail">Therapist Email (Optional)</Label>
                    <Input
                      id="therapistEmail"
                      type="email"
                      placeholder="therapist@example.com"
                      value={registerForm.therapistEmail}
                      onChange={(e) => setRegisterForm({ ...registerForm, therapistEmail: e.target.value })}
                      className={errors.therapistEmail ? 'border-red-500' : ''}
                    />
                    {errors.therapistEmail && <p className="text-xs text-red-600">{errors.therapistEmail}</p>}
                    <p className="text-xs text-gray-600">Your journal entries can be shared with your therapist</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={registerForm.agreeToTerms}
                        onCheckedChange={(checked) => 
                          setRegisterForm({ ...registerForm, agreeToTerms: checked as boolean })
                        }
                      />
                      <Label htmlFor="terms" className="text-xs leading-normal">
                        I agree to the <button type="button" className="text-blue-600 underline">Terms of Service</button> and <button type="button" className="text-blue-600 underline">Privacy Policy</button>
                      </Label>
                    </div>
                    {errors.terms && <p className="text-xs text-red-600 ml-6">{errors.terms}</p>}

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="hipaa"
                        checked={registerForm.agreeToHipaa}
                        onCheckedChange={(checked) => 
                          setRegisterForm({ ...registerForm, agreeToHipaa: checked as boolean })
                        }
                      />
                      <Label htmlFor="hipaa" className="text-xs leading-normal">
                        <div className="flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          I acknowledge the <button type="button" className="text-blue-600 underline">HIPAA Privacy Notice</button>
                        </div>
                      </Label>
                    </div>
                    {errors.hipaa && <p className="text-xs text-red-600 ml-6">{errors.hipaa}</p>}
                  </div>

                  {errors.submit && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.submit}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DisclaimerFooter />
      </div>
    </div>
  );
}