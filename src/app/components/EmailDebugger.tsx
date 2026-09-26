import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Mail, Send, Key, ExternalLink } from 'lucide-react';
import { publicAnonKey } from '../utils/supabase/info';

export function EmailDebugger() {
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);

  const checkConfiguration = async () => {
    setChecking(true);
    try {
      console.log('🔍 publicAnonKey:', publicAnonKey ? 'EXISTS' : 'MISSING');
      console.log('🔍 publicAnonKey length:', publicAnonKey?.length);
      
      const response = await fetch(
        'https://pyixvaanmebwlxsivlue.supabase.co/functions/v1/make-server-2538a5b0/check-config',
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        console.error('❌ Response not OK:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error' }));
        console.error('❌ Error data:', errorData);
        setConfigStatus({ 
          resendConfigured: false,
          error: `Server error: ${response.status}` 
        });
        return;
      }
      
      const data = await response.json();
      setConfigStatus(data);
      console.log('📊 Configuration status:', data);
    } catch (error) {
      console.error('Error checking config:', error);
      setConfigStatus({ 
        resendConfigured: false,
        error: String(error) 
      });
    } finally {
      setChecking(false);
    }
  };

  const addApiKey = () => {
    // This will trigger the Figma Make UI to show a modal for adding the API key
    if (window.parent) {
      window.parent.postMessage({
        type: 'CREATE_SECRET',
        secretName: 'RESEND_API_KEY'
      }, '*');
    }
  };

  const sendTestEmail = async () => {
    setSending(true);
    setTestResult(null);
    try {
      const testEmail = 'delivered@resend.dev'; // Resend's built-in test address
      
      const response = await fetch(
        'https://pyixvaanmebwlxsivlue.supabase.co/functions/v1/make-server-2538a5b0/send-to-therapist',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            therapistEmail: testEmail,
            patientName: 'Test Patient',
            patientEmail: 'test@example.com',
            entryDate: new Date().toISOString(),
            emotions: {
              joy: 7,
              anxiety: 3,
              sadness: 2,
              overall: 7
            }
          })
        }
      );

      const result = await response.json();
      setTestResult({ 
        success: response.ok, 
        status: response.status,
        data: result 
      });
      console.log('📧 Test email result:', result);
    } catch (error) {
      console.error('Error sending test email:', error);
      setTestResult({ success: false, error: String(error) });
    } finally {
      setSending(false);
    }
  };

  const saveApiKey = async () => {
    setSaving(true);
    setSaveResult(null);
    try {
      console.log('🔑 Saving API key, length:', apiKey?.length);
      console.log('🔑 API key starts with re_:', apiKey?.startsWith('re_'));
      
      const response = await fetch(
        'https://pyixvaanmebwlxsivlue.supabase.co/functions/v1/make-server-2538a5b0/save-api-key',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            apiKey: apiKey
          })
        }
      );

      console.log('🔑 Response status:', response.status);
      const result = await response.json();
      console.log('🔑 Response data:', result);
      
      setSaveResult(result.message || result.error);
      console.log('🔑 API Key save result:', result);
      
      // Auto-refresh configuration after saving
      setTimeout(() => {
        checkConfiguration();
      }, 500);
    } catch (error) {
      console.error('Error saving API key:', error);
      setSaveResult('Error saving API key');
    } finally {
      setSaving(false);
    }
  };

  React.useEffect(() => {
    checkConfiguration();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Mail className="w-6 h-6 text-purple-600" />
          Email Configuration Debugger
        </h1>

        {/* Configuration Status */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Configuration Status</h2>
            <button
              onClick={checkConfiguration}
              disabled={checking}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
            >
              {checking ? 'Checking...' : 'Refresh'}
            </button>
          </div>

          {configStatus && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                {configStatus.resendConfigured ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <p className="font-medium">Resend API Key</p>
                  <p className="text-sm text-gray-600">
                    {configStatus.resendConfigured 
                      ? `✅ Configured (${configStatus.resendKeyLength} characters, starts with "${configStatus.resendKeyPrefix}")` 
                      : '❌ Not configured or invalid'}
                  </p>
                </div>
              </div>

              {!configStatus.resendConfigured && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-yellow-800 mb-3">🔑 Paste Your Resend API Key Below:</p>
                      
                      <div className="bg-white border border-yellow-300 rounded p-4 mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Resend API Key (starts with "re_")
                        </label>
                        <input
                          type="text"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="re_xxxxxxxxxxxxxxxxxx"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                        />
                        <button
                          onClick={saveApiKey}
                          disabled={saving || !apiKey.trim()}
                          className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Key className="w-4 h-4" />
                          {saving ? 'Saving...' : 'Save API Key'}
                        </button>
                        {saveResult && (
                          <p className="mt-2 text-sm text-green-700">
                            ✅ {saveResult}
                          </p>
                        )}
                      </div>

                      <div className="bg-white border border-blue-300 rounded p-3">
                        <p className="text-sm font-semibold text-blue-900 mb-2">Don't have an API key yet?</p>
                        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside ml-2">
                          <li>
                            Go to{' '}
                            <a 
                              href="https://resend.com/signup" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="underline font-medium text-blue-700 hover:text-blue-800"
                            >
                              resend.com/signup <ExternalLink className="inline w-3 h-3" />
                            </a>
                          </li>
                          <li>Create a free account (no credit card needed)</li>
                          <li>After login, click <strong>"API Keys"</strong> in the sidebar</li>
                          <li>Click <strong>"Create API Key"</strong> button</li>
                          <li>Copy the key and paste it above</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Test Email */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Send Test Email</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-4">
              This will send a test email to Resend's built-in test address (<code className="bg-gray-200 px-1 rounded">delivered@resend.dev</code>). 
              This is a special address that always accepts emails for testing purposes.
            </p>

            <button
              onClick={sendTestEmail}
              disabled={sending || !configStatus?.resendConfigured}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              {sending ? 'Sending...' : 'Send Test Email'}
            </button>

            {!configStatus?.resendConfigured && (
              <p className="text-sm text-red-600 mt-2">
                ⚠️ Configure Resend API key first
              </p>
            )}
          </div>

          {/* Test Results */}
          {testResult && (
            <div className={`mt-4 p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-semibold ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {testResult.success ? '✅ Test Email Sent!' : '❌ Test Failed'}
                  </p>
                  <pre className="text-sm mt-2 overflow-auto bg-white p-3 rounded border">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>

                  {testResult.success && testResult.data?.emailSent && (
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <p className="text-sm text-blue-800">
                        <strong>✨ Success!</strong> Email was sent successfully. 
                        {testResult.data.messageId && (
                          <span> Message ID: <code className="bg-blue-100 px-1 rounded">{testResult.data.messageId}</code></span>
                        )}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Note: The test address (delivered@resend.dev) accepts emails but doesn't actually deliver them. 
                        To test with real delivery, try your own email address.
                      </p>
                    </div>
                  )}

                  {testResult.success && !testResult.data?.emailSent && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded">
                      <p className="text-sm text-yellow-800">
                        <strong>⚠️ Partial Success:</strong> Entry was saved, but email wasn't sent.
                        <br />
                        <span className="text-xs">{testResult.data?.message}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Setup Guide */}
        <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-900 mb-3">Quick Setup Guide</h3>
          <div className="space-y-2 text-sm text-purple-800">
            <p><strong>1. Sign up for Resend (FREE):</strong></p>
            <p className="pl-4">→ Visit <a href="https://resend.com/signup" target="_blank" rel="noopener noreferrer" className="underline font-medium">resend.com/signup</a></p>
            
            <p className="pt-2"><strong>2. Get your API key:</strong></p>
            <p className="pl-4">→ Dashboard → API Keys → Create API Key</p>
            <p className="pl-4">→ Copy the key (starts with "re_")</p>
            
            <p className="pt-2"><strong>3. Add to your app:</strong></p>
            <p className="pl-4">→ Click "Add API Key" button (top right)</p>
            <p className="pl-4">→ Paste your Resend API key</p>
            
            <p className="pt-2"><strong>4. Test:</strong></p>
            <p className="pl-4">→ Click "Refresh" above to verify</p>
            <p className="pl-4">→ Click "Send Test Email" to confirm it works</p>
          </div>
        </div>
      </div>
    </div>
  );
}