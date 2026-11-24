import React from 'react';

const About = () => {
  return (
    <div className="container px-4 py-10 mx-auto max-w-7xl">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-800 dark:text-white">About NIDS</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Network Intrusion Detection System powered by Machine Learning
        </p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">About the Project</h2>
          <p className="text-gray-600 dark:text-gray-300">
            This Network Intrusion Detection System (NIDS) is designed to detect and classify various types of network 
            intrusions using machine learning algorithms. The system analyzes network traffic data to identify potential 
            security threats and intrusions.
          </p>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            The system is trained on the NSL-KDD dataset, which is a refined version of the KDD Cup 1999 dataset for 
            network intrusion detection. It can detect various types of attacks, including Denial of Service (DoS), 
            Probing, Remote to Local (R2L), and User to Root (U2R) attacks.
          </p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">Key Features</h2>
          <ul className="space-y-2 text-gray-600 list-disc list-inside dark:text-gray-300">
            <li>Real-time network traffic analysis</li>
            <li>Batch processing of network logs</li>
            <li>Dashboard with visualization of detected intrusions</li>
            <li>Upload functionality for custom data</li>
            <li>RESTful API for integration with other systems</li>
          </ul>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">Technologies Used</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800 dark:text-white">Frontend</h3>
              <ul className="space-y-1 text-gray-600 list-disc list-inside dark:text-gray-300">
                <li>React</li>
                <li>Tailwind CSS</li>
                <li>Chart.js</li>
                <li>Framer Motion</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800 dark:text-white">Backend</h3>
              <ul className="space-y-1 text-gray-600 list-disc list-inside dark:text-gray-300">
                <li>FastAPI</li>
                <li>Python</li>
                <li>Scikit-learn</li>
                <li>Pandas</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">NSL-KDD Dataset</h2>
          <p className="text-gray-600 dark:text-gray-300">
            The NSL-KDD dataset is a data set suggested to solve some of the inherent problems of the KDD'99 data set. 
            The NSL-KDD data set has the following advantages over the original KDD data set:
          </p>
          <ul className="mt-2 space-y-1 text-gray-600 list-disc list-inside dark:text-gray-300">
            <li>It does not include redundant records in the train set, so the classifiers will not be biased towards more frequent records.</li>
            <li>There are no duplicate records in the proposed test sets; therefore, the performance of the learners is not biased by the methods which have better detection rates on the frequent records.</li>
            <li>The number of selected records from each difficulty level group is inversely proportional to the percentage of records in the original KDD data set.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About; 