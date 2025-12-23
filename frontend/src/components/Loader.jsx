function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      <p className="mt-4 text-gray-600 font-medium">Parsing your document...</p>
    </div>
  );
}

export default Loader;
