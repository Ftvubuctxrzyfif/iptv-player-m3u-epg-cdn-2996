import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <Card className="max-w-md w-full p-8 text-center bg-slate-800/50 border-slate-700">
        <FileQuestion className="h-20 w-20 text-blue-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <h2 className="text-xl font-semibold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-6">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
          <Home className="h-4 w-4 mr-2" />
          Return Home
        </Button>
      </Card>
    </div>
  );
};

export default NotFound;