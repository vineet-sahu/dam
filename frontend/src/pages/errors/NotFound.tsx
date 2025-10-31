import { AlertTriangle } from 'lucide-react';
import ErrorPage from './ErrorPage';

const NotFound = () => (
  <ErrorPage
    code="404"
    title="Page Not Found"
    message="The page you're looking for doesn't exist or has been moved."
    icon={AlertTriangle}
  />
);

export default NotFound;
