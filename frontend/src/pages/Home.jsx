import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import BlogRenderer from '../components/BlogRenderer';
import Loader from '../components/Loader';
import { uploadDocument } from '../services/api';

function Home() {
  const [loading, setLoading] = useState(false);
  const [blogContent, setBlogContent] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async (file) => {
    setLoading(true);
    setError(null);
    setBlogContent(null);

    try {
      const response = await uploadDocument(file);
      
      if (response.success) {
        setBlogContent(response.data.content);
      } else {
        setError('Failed to parse document');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Transform Documents into <span className="text-primary">Beautiful Blogs</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your PDF, DOC, or PPT files and instantly convert them to formatted blog posts
          </p>
        </div>

        {/* Upload Section */}
        {!blogContent && !loading && (
          <div className="mb-12">
            <FileUpload onUpload={handleUpload} />
          </div>
        )}

        {/* Loading State */}
        {loading && <Loader />}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Blog Content */}
        {blogContent && (
          <div>
            <div className="text-center mb-8">
              <button
                onClick={() => setBlogContent(null)}
                className="text-primary hover:text-blue-700 font-medium"
              >
                ← Upload New Document
              </button>
            </div>
            <BlogRenderer content={blogContent} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
