import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header Banner */}
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
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
                    <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
                        We respect your privacy and are committed to protecting your personal data.
                    </p>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 pb-20">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-10 text-gray-700 leading-relaxed ring-1 ring-gray-100 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-[#2d3992] border-b border-gray-100 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center">
                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-[#f15925] text-lg font-bold mb-2 sm:mb-0 sm:mr-3 border border-blue-100">1</span>
                            Introduction
                        </h2>
                        <div className="text-gray-600 pl-0 sm:pl-14">
                            <p>
                                Welcome to 247CutBend. We respect your privacy and are committed to protecting your personal data.
                                This privacy policy will inform you about how we look after your personal data when you visit our
                                website and tell you about your privacy rights and how the law protects you.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-[#2d3992] border-b border-gray-100 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center">
                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-[#f15925] text-lg font-bold mb-2 sm:mb-0 sm:mr-3 border border-blue-100">2</span>
                            Data We Collect
                        </h2>
                        <div className="text-gray-600 pl-0 sm:pl-14">
                            <p className="mb-4">
                                We may collect, use, store and transfer different kinds of personal data about you which we have
                                grouped together as follows:
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <span className="text-[#f15925] mr-2 mt-1.5">•</span>
                                    <span><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-[#f15925] mr-2 mt-1.5">•</span>
                                    <span><strong>Contact Data</strong> includes email address and telephone numbers.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-[#f15925] mr-2 mt-1.5">•</span>
                                    <span><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-[#f15925] mr-2 mt-1.5">•</span>
                                    <span><strong>Usage Data</strong> includes information about how you use our website, products and services.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-[#2d3992] border-b border-gray-100 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center">
                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-[#f15925] text-lg font-bold mb-2 sm:mb-0 sm:mr-3 border border-blue-100">3</span>
                            How We Use Your Data
                        </h2>
                        <div className="text-gray-600 pl-0 sm:pl-14">
                            <p className="mb-4">
                                We will only use your personal data when the law allows us to. Most commonly, we will use your
                                personal data in the following circumstances:
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <span className="text-[#f15925] mr-2 mt-1.5">•</span>
                                    <span>To provide and maintain our Service.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-[#f15925] mr-2 mt-1.5">•</span>
                                    <span>To notify you about changes to our Service.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-[#f15925] mr-2 mt-1.5">•</span>
                                    <span>To provide customer support.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-[#f15925] mr-2 mt-1.5">•</span>
                                    <span>To gather analysis or valuable information so that we can improve our Service.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-[#2d3992] border-b border-gray-100 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center">
                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-[#f15925] text-lg font-bold mb-2 sm:mb-0 sm:mr-3 border border-blue-100">4</span>
                            Data Security
                        </h2>
                        <div className="text-gray-600 pl-0 sm:pl-14">
                            <p>
                                We have put in place appropriate security measures to prevent your personal data from being
                                accidentally lost, used or accessed in an unauthorised way, altered or disclosed.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-[#2d3992] border-b border-gray-100 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center">
                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-[#f15925] text-lg font-bold mb-2 sm:mb-0 sm:mr-3 border border-blue-100">5</span>
                            Contact Us
                        </h2>
                        <div className="text-gray-600 pl-0 sm:pl-14">
                            <p className="mb-4">
                                If you have any questions about this privacy policy or our privacy practices, please contact us at:
                            </p>
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <div className="flex flex-col space-y-3">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#2d3992] mr-3">
                                            <i className="fas fa-envelope text-sm"></i>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500 block">Email</span>
                                            <a href="mailto:sales@247cutbend.in" className="font-semibold text-[#2d3992] hover:text-[#f15925] transition-colors">sales@247cutbend.in</a>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#2d3992] mr-3">
                                            <i className="fas fa-phone text-sm"></i>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500 block">Phone</span>
                                            <a href="tel:+919004073379" className="font-semibold text-[#2d3992] hover:text-[#f15925] transition-colors">+91 9004073379</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
