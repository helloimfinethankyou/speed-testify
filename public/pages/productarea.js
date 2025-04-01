import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ProductArea() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    websiteUrl: '',
    testGoals: '',
    targetAudience: '',
    testTasks: '',
    language: 'de'
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Für lokale Entwicklung: Direkt zur Progress-Seite weiterleiten
    window.location.href = 'progress.html';
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    
    if (selectedFile.size > 1024 * 1024) {
      setError('Die Datei darf nicht größer als 1MB sein');
      return;
    }

    const allowedTypes = [
      'application/zip',
      'text/html',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Nur ZIP, HTML, JPG, JPEG, PNG oder GIF Dateien sind erlaubt');
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-blue-600">Testtastic</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Test-Konfiguration</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Website URL (optional)
              </label>
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Test-Ziele
              </label>
              <textarea
                value={formData.testGoals}
                onChange={(e) => setFormData({ ...formData, testGoals: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows="3"
                required
                placeholder="z.B. Überprüfung der Benutzerfreundlichkeit und Navigation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Zielgruppe
              </label>
              <textarea
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows="2"
                required
                placeholder="z.B. Erwachsene zwischen 25-45 Jahren"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Test-Aufgaben
              </label>
              <textarea
                value={formData.testTasks}
                onChange={(e) => setFormData({ ...formData, testTasks: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows="4"
                required
                placeholder="z.B. 1. Finden Sie das Kontaktformular, 2. Senden Sie eine Nachricht"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sprache
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="de">Deutsch</option>
                <option value="en">Englisch</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prototyp hochladen (optional)
              </label>
              <div
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                } ${isDragging ? '' : 'border-dashed'} rounded-md transition-colors duration-200`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-1 text-center">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".zip,.html,.jpg,.jpeg,.png,.gif"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Datei auswählen</span>
                  </label>
                  {file && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-700">
                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    {isDragging ? 'Datei hier ablegen' : 'ZIP, HTML, JPG, JPEG, PNG oder GIF bis zu 1MB'}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Test starten
              </button>
            </div>
          </form>
        </div>
      </div>

      <footer className="bg-gray-800 mt-16">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-400">
              &copy; 2024 Testtastic. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 