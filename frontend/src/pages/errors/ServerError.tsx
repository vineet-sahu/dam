import { ServerCrash } from 'lucide-react';
import ErrorPage from './ErrorPage';

const ServerError = () => (
  <ErrorPage
    code="500"
    title="Server Error"
    message="Something went wrong on our end. We're working to fix it. Please try again later."
    icon={ServerCrash}
    showBackButton={false}
  />
);

export default ServerError;
