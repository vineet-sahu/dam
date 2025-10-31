import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface ErrorPageProps {
  code: string;
  title: string;
  message: string;
  icon: LucideIcon;
  showHomeButton?: boolean;
  showBackButton?: boolean;
}

const ErrorPage = ({ code, title, message, icon: Icon, showHomeButton = true }: ErrorPageProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-red-50 rounded-full">
            <Icon className="w-16 h-16 text-red-500" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-gray-800 mb-2">{code}</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">{title}</h2>
        <p className="text-gray-600 mb-8">{message}</p>

        <div className="flex gap-3 justify-center">
          {showHomeButton && (
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
