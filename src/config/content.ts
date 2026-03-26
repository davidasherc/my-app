// Centralized content configuration for easy editing
export const contentConfig = {
  // App Identity
  branding: {
    appName: "Emotion Journal", // Will be overridden by BrandingProvider
    tagline: "Your personal wellness companion",
    companyName: "Your Wellness Company",
    year: "2024"
  },

  // Loading and Authentication
  loading: {
    message: "Preparing your wellness journey...",
    altMessage: "Loading your emotional wellness app..."
  },

  auth: {
    signIn: {
      title: "Welcome back",
      subtitle: "Sign in to access your emotional wellness journal",
      buttonText: "Sign In",
      demoText: "Demo: Use email \"demo@example.com\" and password \"demo123\""
    },
    signUp: {
      title: "Create your account", 
      subtitle: "Start your emotional wellness journey with secure, private tracking",
      buttonText: "Create Account",
      termsText: "I agree to the Terms of Service and Privacy Policy",
      hipaaText: "I acknowledge the HIPAA Privacy Notice"
    },
    security: {
      title: "Secure & Private",
      subtitle: "End-to-end encrypted, HIPAA compliant"
    }
  },

  // Navigation
  navigation: {
    journal: "Journal",
    insights: "Insights", 
    upgrade: "Upgrade",
    plans: "Plans",
    profile: "Profile",
    customize: "Customize",
    privacy: "Privacy"
  },

  // Main App Content
  journal: {
    title: "How are you feeling today?",
    subtitle: "Take a moment to check in with your emotions",
    instructions: "Move the sliders to reflect how you're feeling right now",
    completeButton: "Complete Entry",
    continueButton: "Continue"
  },

  // Emotions
  emotions: {
    happiness: {
      label: "Happiness",
      description: "How joyful and content do you feel?"
    },
    anxiety: {
      label: "Anxiety", 
      description: "How worried or nervous do you feel?"
    },
    sadness: {
      label: "Sadness",
      description: "How down or melancholy do you feel?"
    },
    anger: {
      label: "Anger",
      description: "How frustrated or irritated do you feel?"
    },
    energy: {
      label: "Energy",
      description: "How energetic and motivated do you feel?"
    },
    overall: {
      label: "Overall Mood",
      description: "How would you rate your general mood?"
    }
  },

  // Subscription & Pricing
  subscription: {
    free: {
      name: "Free Plan",
      description: "Perfect for getting started with emotional tracking",
      features: [
        "3 basic emotion sliders",
        "5-day history",
        "Basic journaling",
        "Therapist sharing",
        "HIPAA compliance"
      ]
    },
    premium: {
      name: "Premium Plan",
      price: "$9.99",
      period: "month",
      description: "Unlock your full emotional wellness potential",
      features: [
        "All 6 emotion sliders",
        "5-month history",
        "Advanced insights & trends",
        "Enhanced therapist reports",
        "Priority support",
        "Export capabilities"
      ]
    },
    upgrade: {
      title: "Upgrade to Premium",
      subtitle: "Unlock deeper insights and keep your complete wellness history",
      buttonText: "Start Premium Trial",
      trialText: "7-day free trial, cancel anytime"
    }
  },

  // Encouragement Messages
  encouragement: {
    trial: {
      title: "Amazing! You've been journaling for {days} days! 🎉",
      subtitle: "Ready to unlock deeper insights and keep your entire wellness history?",
      buttonText: "Upgrade Now"
    },
    milestones: {
      firstWeek: "Congratulations on your first week of emotional tracking!",
      oneMonth: "You've completed a full month of wellness journaling!",
      threeMonths: "Three months of consistent emotional awareness - incredible!",
      oneYear: "A full year of emotional growth and self-awareness! 🎊"
    }
  },

  // Profile & Account
  profile: {
    title: "Your Wellness Profile",
    subtitle: "Manage your account and track your progress",
    sections: {
      therapist: "Connected Therapist",
      memberSince: "Member Since",
      usage: {
        entries: "Journal Entries",
        daysActive: "Days Active", 
        daysVisible: "Days Visible"
      }
    },
    buttons: {
      unlockHistory: "Unlock Complete History",
      signOut: "Sign Out"
    }
  },

  // Success & Confirmation
  success: {
    title: "Entry Saved Successfully!",
    subtitle: "Your emotional check-in has been recorded securely",
    therapistSent: "Your entry has been shared with your therapist",
    newEntryButton: "New Entry",
    viewInsightsButton: "View Insights"
  },

  // Review Entry
  review: {
    title: "Review Your Entry",
    subtitle: "Take a moment to review before saving",
    sendToTherapist: "Send to Therapist",
    saveOnly: "Save Only",
    backButton: "Back to Edit"
  },

  // Analytics & Insights  
  insights: {
    title: "Your Emotional Insights",
    subtitle: "Understanding your emotional patterns over time",
    trends: "Emotional Trends",
    patterns: "Weekly Patterns", 
    correlations: "Mood Correlations",
    recommendations: "Personalized Recommendations",
    upgradePrompt: "Unlock advanced analytics with Premium"
  },

  // Footer
  footer: {
    copyright: "© {year} {company}. All rights reserved.",
    hipaaCompliant: "HIPAA-compliant emotional wellness tracking",
    links: {
      privacy: "Privacy Policy",
      terms: "Terms of Service", 
      support: "Support",
      about: "About Us"
    }
  },

  // Error Messages
  errors: {
    generic: "Something went wrong. Please try again.",
    network: "Network error. Please check your connection.",
    auth: "Authentication failed. Please check your credentials.",
    subscription: "Subscription error. Please contact support."
  },

  // Labels and Badges
  labels: {
    free: "Free",
    premium: "Premium", 
    pro: "Pro",
    limited: "Limited",
    beta: "Beta",
    new: "New"
  }
};

// Helper function to get content with replacements
export function getContent(path: string, replacements: Record<string, string> = {}) {
  const keys = path.split('.');
  let content: any = contentConfig;
  
  for (const key of keys) {
    content = content?.[key];
  }
  
  if (typeof content === 'string') {
    // Replace placeholders like {days}, {company}, etc.
    Object.entries(replacements).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{${key}}`, 'g'), value);
    });
  }
  
  return content;
}

// Theme-specific content variations
export const themeContent = {
  healthcare: {
    appName: "HealthMind Pro",
    tagline: "Professional mental health monitoring",
    journal: {
      title: "Patient Mood Assessment",
      subtitle: "Complete your daily emotional health check-in"
    }
  },
  
  wellness: {
    appName: "Serene",
    tagline: "Your mindful wellness companion", 
    journal: {
      title: "Mindfulness Check-In",
      subtitle: "Connect with your inner self and emotional state"
    }
  },
  
  therapy: {
    appName: "TherapySpace",
    tagline: "Safe space for emotional growth",
    journal: {
      title: "Emotional Processing",
      subtitle: "Explore and understand your feelings in a safe environment"
    }
  }
};