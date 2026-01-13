import React from 'react';

const TermsAndConditions = () => {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header Banner - Added top padding to account for fixed navbar */}
            <div className="bg-[#2d3992] text-white px-4 shadow-md relative overflow-hidden">
                {/* Decorative background pattern */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <svg width="100%" height="100%">
                        <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="max-w-4xl mx-auto relative z-10 text-center animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms & Conditions</h1>
                    <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
                        Please read these terms and conditions carefully before using our service.
                    </p>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 pb-20">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-10 text-gray-700 leading-relaxed ring-1 ring-gray-100 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-[#2d3992] border-b border-gray-100 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center">
                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-[#f15925] text-lg font-bold mb-2 sm:mb-0 sm:mr-3 border border-blue-100">1</span>
                            Agreement to Terms
                        </h2>
                        <p className="text-gray-600 pl-0 sm:pl-14">
                            By accessing or using our website, you agree to be bound by these Terms and Conditions and our
                            Privacy Policy. If you disagree with any part of these terms, then you may not access the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-[#2d3992] border-b border-gray-100 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center">
                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-[#f15925] text-lg font-bold mb-2 sm:mb-0 sm:mr-3 border border-blue-100">2</span>
                            Intellectual Property
                        </h2>
                        <p className="text-gray-600 pl-0 sm:pl-14">
                            The Service and its original content, features, and functionality are and will remain the exclusive
                            property of 247CutBend and its licensors.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-[#2d3992] border-b border-gray-100 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center">
                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-[#f15925] text-lg font-bold mb-2 sm:mb-0 sm:mr-3 border border-blue-100">3</span>
                            Use License
                        </h2>
                        <p className="text-gray-600 pl-0 sm:pl-14">
                            Permission is granted to temporarily download one copy of the materials (information or software)
                            on 247CutBend's website for personal, non-commercial transitory viewing only.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-[#2d3992] border-b border-gray-100 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center">
                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-[#f15925] text-lg font-bold mb-2 sm:mb-0 sm:mr-3 border border-blue-100">4</span>
                            Disclaimer
                        </h2>
                        <p className="text-gray-600 pl-0 sm:pl-14">
                            The materials on 247CutBend's website are provided on an 'as is' basis. 247CutBend makes no
                            warranties, expressed or implied, and hereby disclaims and negates all other warranties including,
                            without limitation, implied warranties or conditions of merchantability, fitness for a particular
                            purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-[#2d3992] border-b border-gray-100 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center">
                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-[#f15925] text-lg font-bold mb-2 sm:mb-0 sm:mr-3 border border-blue-100">5</span>
                            Governing Law
                        </h2>
                        <p className="text-gray-600 pl-0 sm:pl-14">
                            These terms and conditions are governed by and construed in accordance with the laws of India
                            and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-[#2d3992] border-b border-gray-100 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center">
                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-[#f15925] text-lg font-bold mb-2 sm:mb-0 sm:mr-3 border border-blue-100">6</span>
                            Changes to Terms
                        </h2>
                        <p className="text-gray-600 pl-0 sm:pl-14">
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                            By continuing to access or use our Service after those revisions become effective, you agree
                            to be bound by the revised terms.
                        </p>
                    </section>

                    <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                        <p>If you have any questions about these Terms, please contact us.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
