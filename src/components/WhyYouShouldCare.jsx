import { useAuth } from '../lib/authContext';
import { CodeBracketIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function WhyYouShouldCare() {
  const { user } = useAuth();
  
  // Determine user type - default to showing both if not logged in
  const isLoggedIn = !!user;
  const userRole = user?.user_metadata?.userRole || 'user';

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-sky-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-12 text-center">
          Why You Should Care
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Technical User Card */}
          {(!isLoggedIn || userRole === 'developer') && (
            <div className="bg-white rounded-xl border-2 border-sky-200 p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <CodeBracketIcon className="h-8 w-8 text-sky-600" />
                <h3 className="text-xl font-bold text-slate-900">For ML Engineers</h3>
              </div>
              <p className="text-slate-700 leading-relaxed">
                You're building something cool and want to share it. Here's the beauty—we handle the messy parts. Upload your edge-optimized models, get instant usage data showing how real people are using them, and iterate fast. No complex infrastructure, no deployment headaches. Your models run on phones, completely offline. Test, hardened, monitored. That's the whole appeal.
              </p>
            </div>
          )}

          {/* Non-Technical User Card */}
          {(!isLoggedIn || userRole === 'user') && (
            <div className="bg-white rounded-xl border-2 border-lime-200 p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <SparklesIcon className="h-8 w-8 text-lime-600" />
                <h3 className="text-xl font-bold text-slate-900">For Everyone Else</h3>
              </div>
              <p className="text-slate-700 leading-relaxed">
                You want AI on your phone. Here's what makes this different—tons of models, all running right on your device. Free. No monthly subscriptions, no ads, no cameras watching what you do. Your data never leaves your phone. Pick a model that sounds useful, tap it, and go. Whether it's translating text, identifying plants, or analyzing photos, everything happens in your pocket.
              </p>
            </div>
          )}
        </div>

        {/* Unauthenticated user message */}
        {!isLoggedIn && (
          <p className="text-center text-slate-600 text-sm mt-8">
            Set your user type in your profile to see personalized content.
          </p>
        )}
      </div>
    </section>
  );
}
