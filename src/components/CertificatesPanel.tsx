/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Certificate } from '../types';
import { Award, Calendar, User, CheckCircle, Printer, X } from 'lucide-react';

interface CertificatesPanelProps {
  certificates: Certificate[];
}

export const CertificatesPanel: React.FC<CertificatesPanelProps> = ({ certificates }) => {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const printCertificate = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {certificates.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center">
          <Award className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h4 className="font-sans font-bold text-lg text-slate-700 dark:text-slate-300 mb-1">No Certificates Yet</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Graduate from any learning track by completing all lessons in that course to receive an official Certificate.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition cursor-pointer group"
              onClick={() => setSelectedCert(cert)}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                     <Award className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200/40 dark:border-green-800/40 font-bold px-2 py-0.5 rounded-full uppercase">
                    Issued
                  </span>
                </div>

                <h4 className="font-sans font-bold text-slate-800 dark:text-slate-100 mt-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  {cert.courseName}
                </h4>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Cert ID: {cert.id}
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {new Date(cert.issuedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                  View Certificate &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Display Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:p-0">
            
            {/* Action Bar (Not printed) */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-850 print:hidden">
              <span className="text-xs font-mono text-slate-400">Namaste Hindi Academy Certificate</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={printCertificate}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-sans font-semibold flex items-center space-x-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Certificate Template Body */}
            <div className="p-8 sm:p-12 text-center bg-amber-50/20 dark:bg-slate-950/10 border-8 border-double border-indigo-500/30 m-4 sm:m-6 rounded-2xl relative">
              {/* Decorative Corner Borders */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-indigo-500/60" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-indigo-500/60" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-indigo-500/60" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-indigo-500/60" />

              <Award className="w-16 h-16 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />

              <h2 className="font-serif text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-wide uppercase">
                Certificate of Graduation
              </h2>
              <p className="text-xs uppercase tracking-widest font-mono text-indigo-600 dark:text-indigo-400 font-bold mt-2">
                Namaste Hindi Language Academy
              </p>

              <div className="w-24 h-0.5 bg-indigo-500/40 mx-auto my-6" />

              <p className="font-serif italic text-lg text-slate-500 dark:text-slate-400">
                This certifies that
              </p>
              <h3 className="font-sans font-bold text-2xl text-slate-800 dark:text-white mt-2 mb-4 border-b border-slate-200/50 max-w-sm mx-auto pb-1">
                {selectedCert.issuedTo}
              </h3>

              <p className="font-serif text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto text-sm sm:text-base">
                has successfully completed the comprehensive curriculum and training course for
              </p>
              <h4 className="font-sans font-black text-xl text-indigo-700 dark:text-indigo-400 mt-3 uppercase tracking-wide">
                {selectedCert.courseName}
              </h4>

              <div className="w-48 h-0.5 bg-indigo-500/20 mx-auto my-6" />

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-xs text-slate-400 mt-8 font-mono">
                <div className="text-left border-r border-slate-200/60 dark:border-slate-800/60 pr-4">
                  <p className="text-[10px] text-slate-400 uppercase">Issue Date</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300">
                    {new Date(selectedCert.issuedAt).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right pl-4">
                  <p className="text-[10px] text-slate-400 uppercase">Verification ID</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300">{selectedCert.id}</p>
                </div>
              </div>

              {/* Holographic Badge graphic */}
              <div className="absolute right-8 bottom-8 hidden sm:flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white border border-indigo-400/40 opacity-75 shadow-lg shadow-indigo-500/20">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-mono text-slate-400 uppercase mt-1">Official Seal</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
