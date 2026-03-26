import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { AuthPageLogo } from './LogoComponent';

interface EmailVerificationProps {
  onVerified: () => void;
}

export function EmailVerification({ onVerified }: EmailVerificationProps) {
  const { user, updateProfile } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to verify code
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real app, you'd verify the code with your backend
      // For now, we'll accept any 6-digit code
      if (verificationCode.length === 6) {
        await updateProfile({ isVerified: true });
        onVerified();
      } else {
        setError('Invalid verification code. Please check and try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendStatus('sending');
    setError('');

    try {
      // Simulate API call to resend verification email
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResendStatus('sent');
      
      // Reset resend status after 3 seconds
      setTimeout(() => {
        setResendStatus('idle');
      }, 3000);
    } catch (err) {
      setError('Failed to resend code. Please try again.');
      setResendStatus('idle');
    }
  };

  const handleSkipForNow = async () => {
    // Allow users to skip verification for demo purposes
    // In production, you might want to remove this or add restrictions
    await updateProfile({ isVerified: true });
    onVerified();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-4">
          <AuthPageLogo />
        </div>

        {/* Verification Card */}
        <Card>
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a verification code to<br />
              <span className="font-medium text-gray-900">{user?.email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => {
                    // Only allow numbers and limit to 6 digits
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setVerificationCode(value);
                  }}
                  maxLength={6}
                  className={`text-center text-lg tracking-widest ${error ? 'border-red-500' : ''}`}
                  autoFocus
                />
                <p className="text-xs text-gray-600 text-center">
                  Check your email inbox and spam folder
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {resendStatus === 'sent' && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Verification code resent! Check your email.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Email
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="space-y-3 pt-4 border-t">
              <div className="text-center text-sm text-gray-600">
                Didn't receive the code?
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendCode}
                disabled={resendStatus === 'sending'}
              >
                {resendStatus === 'sending' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend Code'
                )}
              </Button>

              {/* Demo skip button - remove in production */}
              <Button
                type="button"
                variant="ghost"
                className="w-full text-xs text-gray-500 hover:text-gray-700"
                onClick={handleSkipForNow}
              >
                Skip for now (Demo only)
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-600 space-y-1">
          <p>🔒 Your email helps us keep your account secure</p>
          <p>We'll never share your email with anyone</p>
        </div>
      </div>
    </div>
  );
}
