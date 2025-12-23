import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function BlogRenderer({ content }) {
  const renderElement = (element) => {
    switch (element.type) {
      case 'heading':
        return (
          <h2 key={element.id} className="text-2xl font-bold text-gray-800 mb-3 mt-6">
            {element.content}
          </h2>
        );
      
      case 'paragraph':
        return (
          <p key={element.id} className="text-gray-700 mb-4 leading-relaxed">
            {element.content}
          </p>
        );
      
      case 'code':
        return (
          <div key={element.id} className="mb-4">
            <SyntaxHighlighter 
              language="javascript" 
              style={vscDarkPlus}
              customStyle={{
                borderRadius: '8px',
                padding: '1rem',
                fontSize: '0.9rem'
              }}
            >
              {element.content}
            </SyntaxHighlighter>
          </div>
        );
      
      case 'list-item':
        return (
          <li key={element.id} className="text-gray-700 ml-6 mb-2 list-disc">
            {element.content}
          </li>
        );
      
      case 'image':
        // Display base64 image if available
        if (element.metadata?.imageData) {
          return (
            <div key={element.id} className="my-6 flex flex-col items-center">
              <img 
                src={`data:image/png;base64,${element.metadata.imageData}`}
                alt={element.content || "Document image"}
                className="max-w-full h-auto rounded-lg shadow-lg border border-gray-200"
              />
              {element.content && (
                <p className="text-sm text-gray-500 mt-2 italic text-center">
                  {element.content}
                </p>
              )}
            </div>
          );
        } else {
          // Placeholder if image data not available
          return (
            <div key={element.id} className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 my-4 text-center">
              <span className="text-gray-500 text-lg">📷 {element.content || 'Image'}</span>
            </div>
          );
        }
      
      case 'table':
        // Render HTML table if available
        if (element.metadata?.htmlTable) {
          return (
            <div 
              key={element.id} 
              className="my-4 overflow-x-auto"
            >
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: element.metadata.htmlTable }}
              />
            </div>
          );
        } else {
          return (
            <div key={element.id} className="text-gray-700 mb-4 bg-gray-50 p-4 rounded border border-gray-200 overflow-x-auto">
              <pre className="whitespace-pre-wrap text-sm">{element.content}</pre>
            </div>
          );
        }
      
      case 'formula':
        return (
          <div key={element.id} className="my-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <code className="text-blue-800">{element.content}</code>
          </div>
        );
      
      default:
        return (
          <p key={element.id} className="text-gray-700 mb-4">
            {element.content}
          </p>
        );
    }
  };

  return (
    <div className="prose max-w-none">
      {content.map((element) => renderElement(element))}
    </div>
  );
}

export default BlogRenderer;
