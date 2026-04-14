/**
 * Content Setup Component
 * This component helps with first-time content initialization and setup
 */

import React, { useState } from 'react';
import { AlertCircle, Upload, CheckCircle } from 'lucide-react';
import { initializeAllContent } from '../utils/contentInitializer';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: () => Promise<void>;
}

export const ContentSetup: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'whyChooseUs',
      title: 'Why Choose Us Section',
      description: 'Initialize Why Choose Us section with features and stats',
      completed: false,
    },
    {
      id: 'freeTrialCourses',
      title: 'Free Trial Courses',
      description: 'Set up free trial courses section',
      completed: false,
    },
    {
      id: 'keyFeatures',
      title: 'Key Features',
      description: 'Initialize key features section',
      completed: false,
    },
    {
      id: 'scholarship',
      title: 'Scholarship Program',
      description: 'Set up scholarship section with WhatsApp integration',
      completed: false,
    },
    {
      id: 'comparison',
      title: 'Comparison Section',
      description: 'Initialize comparison (Why Are We The Best)',
      completed: false,
    },
    {
      id: 'companies',
      title: 'Company Logos',
      description: 'Set up companies section (logos to be added manually)',
      completed: false,
    },
  ]);

  const handleInitializeAll = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await initializeAllContent();

      if (result.success) {
        setSteps(steps.map((step) => ({ ...step, completed: true })));
        setSuccess('All content sections initialized successfully!');
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred during initialization');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const allCompleted = steps.every((step) => step.completed);

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Content Setup</h2>
        <p className="text-gray-600">
          Initialize all content sections for your website
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="text-green-600" size={20} />
          <div>
            <h3 className="font-semibold text-green-900">Success</h3>
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Setup Steps</h3>
        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg border-2 transition ${
                step.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white ${
                    step.completed ? 'bg-green-600' : 'bg-gray-400'
                  }`}
                >
                  {step.completed ? '✓' : '○'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{step.title}</h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-800">
          <strong>Next Steps After Initialization:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-blue-700">
            <li>Upload company logos in the Companies section</li>
            <li>Update WhatsApp link in the Scholarship section</li>
            <li>Customize all text and descriptions as needed</li>
            <li>Add hero image and brochure if not already done</li>
          </ul>
        </p>
      </div>

      <button
        onClick={handleInitializeAll}
        disabled={loading || allCompleted}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-white ${
          allCompleted
            ? 'bg-gray-400 cursor-not-allowed'
            : loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        <Upload size={20} />
        {loading
          ? 'Initializing...'
          : allCompleted
            ? 'All Sections Initialized'
            : 'Initialize All Sections'}
      </button>

      <p className="text-center text-sm text-gray-500 mt-4">
        This action will populate all content sections with default values.
        <br />
        You can edit each section individually afterward.
      </p>
    </div>
  );
};

export default ContentSetup;
