import { XCircle } from 'lucide-react';
import ErrorPage from './ErrorPage';

const Forbidden = () => (
  <ErrorPage
    code="403"
    title="Access Forbidden"
    message="You don't have permission to access this resource. Contact your administrator if you believe this is an error."
    icon={XCircle}
  />
);

export default Forbidden;
