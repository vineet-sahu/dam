import { Lock } from 'lucide-react';
import ErrorPage from './ErrorPage';

const Unauthorized = () => (
  <ErrorPage
    code="401"
    title="Unauthorized"
    message="You need to be authenticated to access this resource. Please log in and try again."
    icon={Lock}
  />
);

export default Unauthorized;
