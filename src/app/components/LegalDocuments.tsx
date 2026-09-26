import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Shield, Lock, Eye, FileText, Scale, Heart } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <Shield className="h-12 w-12 text-blue-600" />
        </div>
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">HIPAA Compliance Notice</p>
              <p>
                Emotion Journal is committed to protecting your health information in accordance with 
                the Health Insurance Portability and Accountability Act (HIPAA) and other applicable privacy laws.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="collection">Data Collection</TabsTrigger>
          <TabsTrigger value="protection">Protection</TabsTrigger>
          <TabsTrigger value="rights">Your Rights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Health Information</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Emotional state ratings and journal entries</li>
                  <li>• Mood patterns and wellness trends</li>
                  <li>• Therapy-related communications (if applicable)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Account Information</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Name, email address, and contact information</li>
                  <li>• Subscription and billing information</li>
                  <li>• Therapist contact information (optional)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Technical Information</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Device information and app usage data</li>
                  <li>• Security logs and audit trails</li>
                  <li>• Anonymized analytics data</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How We Collect Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Direct Collection</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Information you provide directly through:
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Account registration and profile setup</li>
                  <li>• Daily emotion tracking and journal entries</li>
                  <li>• Communication with support or your therapist</li>
                  <li>• Subscription and payment processing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Automatic Collection</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Information collected automatically for security and functionality:
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• App usage patterns and feature utilization</li>
                  <li>• Security events and authentication logs</li>
                  <li>• Performance metrics and error reports</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Data Protection & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Encryption</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• All data encrypted in transit using TLS 1.3</li>
                  <li>• Data encrypted at rest using AES-256 encryption</li>
                  <li>• End-to-end encryption for therapist communications</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Access Controls</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Multi-factor authentication required</li>
                  <li>• Role-based access controls for staff</li>
                  <li>• Regular access reviews and audits</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Infrastructure</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• HIPAA-compliant cloud infrastructure</li>
                  <li>• Regular security assessments and penetration testing</li>
                  <li>• 24/7 security monitoring and incident response</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Privacy Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">HIPAA Rights</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Right to access your health information</li>
                  <li>• Right to request amendments to your records</li>
                  <li>• Right to request restrictions on use/disclosure</li>
                  <li>• Right to an accounting of disclosures</li>
                  <li>• Right to request confidential communications</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Additional Rights</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Right to data portability and export</li>
                  <li>• Right to delete your account and data</li>
                  <li>• Right to opt-out of non-essential data processing</li>
                  <li>• Right to notification of data breaches</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Contact Information</h4>
                <p className="text-sm text-muted-foreground">
                  Privacy Officer: privacy@emotionjournal.com<br />
                  Phone: 1-800-PRIVACY (1-800-774-8229)<br />
                  Mail: Privacy Officer, Emotion Journal Inc., [Address]
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <Scale className="h-12 w-12 text-blue-600" />
        </div>
        <h1>Terms of Service</h1>
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Important Notice</p>
              <p>
                By using Emotion Journal, you agree to these terms and acknowledge that this app 
                is for wellness tracking and is not a substitute for professional medical care.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              By accessing and using the Emotion Journal mobile application ("Service"), you accept 
              and agree to be bound by the terms and provision of this agreement.
            </p>
            <p>
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Medical Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>This app is NOT a medical device and is not intended to diagnose, treat, 
              cure, or prevent any disease or medical condition.</strong>
            </p>
            <p>
              The Service is designed for wellness tracking and emotional self-awareness. 
              Always consult with qualified healthcare professionals for medical advice.
            </p>
            <p>
              In case of medical emergencies, contact emergency services immediately.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Subscription Terms</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Subscription fees are charged in advance on a monthly or yearly basis and are non-refundable 
              except as required by law or as specified in our refund policy.
            </p>
            <p>
              You may cancel your subscription at any time through your account settings. 
              Cancellation will take effect at the end of your current billing period.
            </p>
            <p>
              We reserve the right to modify subscription prices with 30 days advance notice.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. User Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>You agree to:</p>
            <ul className="space-y-1 ml-4">
              <li>• Provide accurate and complete information</li>
              <li>• Maintain the security of your account credentials</li>
              <li>• Use the Service only for its intended purpose</li>
              <li>• Comply with all applicable laws and regulations</li>
              <li>• Not share or transfer your account to others</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Data Security & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              We implement industry-standard security measures to protect your personal health information 
              in compliance with HIPAA and other applicable privacy laws.
            </p>
            <p>
              However, no method of transmission over the internet is 100% secure. While we strive to 
              protect your information, we cannot guarantee absolute security.
            </p>
            <p>
              Please review our Privacy Policy for detailed information about data handling practices.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              To the maximum extent permitted by law, Emotion Journal Inc. shall not be liable for any 
              indirect, incidental, special, consequential, or punitive damages resulting from your use 
              of the Service.
            </p>
            <p>
              Our total liability to you for all claims shall not exceed the amount paid by you for 
              the Service in the 12 months preceding the claim.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              For questions about these Terms of Service, please contact us at:
            </p>
            <p>
              Email: legal@emotionjournal.com<br />
              Phone: 1-800-EMOTION (1-800-366-8466)<br />
              Address: [Company Address]
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function HIPAANotice() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <Heart className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <h1>HIPAA Notice of Privacy Practices</h1>
        <p className="text-muted-foreground">
          This notice describes how medical information about you may be used and disclosed 
          and how you can get access to this information.
        </p>
      </div>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <Shield className="h-8 w-8 text-green-600 mx-auto" />
            <h3 className="font-semibold text-green-900">Your Health Information is Protected</h3>
            <p className="text-sm text-green-800">
              We are required by law to maintain the privacy of your health information and 
              to provide you with this notice of our legal duties and privacy practices.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>How We May Use & Disclose Your Health Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">Treatment</h4>
              <p>
                We may use your health information to facilitate treatment coordination with 
                your healthcare providers, including sharing journal entries with your therapist 
                with your explicit consent.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Health Care Operations</h4>
              <p>
                We may use your information to improve our services, conduct quality assessments, 
                and ensure the security and functionality of our platform.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">As Required by Law</h4>
              <p>
                We will disclose your health information when required by federal, state, or local law, 
                including reporting requirements for public health and safety.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Rights Regarding Your Health Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-foreground mb-1">Access</h4>
                <p>Right to inspect and copy your health information</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Amendment</h4>
                <p>Right to request changes to your health information</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Restriction</h4>
                <p>Right to request limits on how we use your information</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Accounting</h4>
                <p>Right to a list of disclosures we have made</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Confidential Communication</h4>
                <p>Right to request communications in a certain way</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Complaint</h4>
                <p>Right to file a complaint about our privacy practices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="mb-4">
              If you have questions about this notice or want to exercise your rights, contact our 
              Privacy Officer:
            </p>
            <div className="space-y-1">
              <p><strong>Privacy Officer</strong></p>
              <p>Email: privacy@emotionjournal.com</p>
              <p>Phone: 1-800-PRIVACY (1-800-774-8229)</p>
              <p>Mail: Privacy Officer, Emotion Journal Inc.</p>
              <p>[Company Address]</p>
            </div>
            <p className="mt-4 text-xs">
              You may also file a complaint with the Secretary of Health and Human Services if you 
              believe your privacy rights have been violated.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}