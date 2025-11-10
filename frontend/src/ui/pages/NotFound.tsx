import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/components/Button';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center px-4 animate-fade-in">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 Number */}
        <div className="mb-8 animate-scale-in">
          <h1 className="text-9xl font-bold text-gradient-primary mb-4 tracking-tight">
            404
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full"></div>
        </div>

        {/* Main Content Card */}
        <div className="card-elevated p-12 mb-8 animate-slide-up">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary-100 to-accent-100 flex items-center justify-center animate-pulse-slow">
              <svg
                className="w-12 h-12 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">
              Page Not Found
            </h2>
            <p className="text-slate-600 text-lg mb-2">
              Oops! The page you're looking for doesn't exist.
            </p>
            <p className="text-slate-500 text-sm">
              It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button onClick={() => navigate('/')}>
              Go to Home
            </Button>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </div>

        {/* Helpful Links */}
        <div className="card p-6 animate-slide-up">
          <p className="text-sm font-semibold text-slate-700 mb-4">
            You might be looking for:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:shadow-soft button-hover-animation"
            >
              Routes
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:shadow-soft button-hover-animation"
            >
              Compare
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:shadow-soft button-hover-animation"
            >
              Banking
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:shadow-soft button-hover-animation"
            >
              Pooling
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

