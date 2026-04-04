import React from 'react';

const sectionTitle = (num, title) => (
    <h2 className="text-xl md:text-2xl font-bold text-[#2d3992] border-b border-gray-100 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center">
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-[#f15925] text-lg font-bold mb-2 sm:mb-0 sm:mr-3 border border-blue-100 shrink-0">
            {num}
        </span>
        {title}
    </h2>
);

const subHeading = (text) => (
    <h3 className="text-lg font-semibold text-[#2d3992] mt-4 mb-2 pl-0 sm:pl-14">{text}</h3>
);

const body = (children) => (
    <div className="text-gray-600 pl-0 sm:pl-14 space-y-3">{children}</div>
);

const PrivacyPolicy = () => {
    return (
        <div className="bg-gray-50">
            <div className="bg-[#2d3992] text-white px-4 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <svg width="100%" height="100%">
                        <pattern id="pp-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#pp-grid)" />
                    </svg>
                </div>

                <div className="max-w-4xl mx-auto relative z-10 text-center animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 pb-4">
                <div
                    className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-gray-700 leading-relaxed ring-1 ring-gray-100 animate-fade-in-up"
                    style={{ animationDelay: '0.1s' }}
                >
                    <div className="space-y-10">
                    <section>
                        {sectionTitle('1', 'Introduction')}
                        {body(
                            <>
                                <p>
                                    247 Cut Bend (A Rishi Laser Enterprise) (&quot;we,&quot; &quot;us,&quot; &quot;our,&quot; or
                                    &quot;Company&quot;) is committed to protecting your privacy and handling your personal
                                    information with transparency, integrity, and care. This Privacy Policy explains how we collect,
                                    use, disclose, store, and protect your personal data when you access or use our website at{' '}
                                    [Website URL] (&quot;Platform&quot;) or engage with our services.
                                </p>
                                <p>
                                    This Policy is published in compliance with the Information Technology Act, 2000 (&quot;IT
                                    Act&quot;), the Information Technology (Reasonable Security Practices and Procedures and
                                    Sensitive Personal Data or Information) Rules, 2011 (&quot;SPDI Rules&quot;), and the Consumer
                                    Protection (E-Commerce) Rules, 2020. We are also mindful of India&apos;s evolving data
                                    protection landscape under the Digital Personal Data Protection Act, 2023 (&quot;DPDP
                                    Act&quot;) and will update this Policy as applicable rules are notified.
                                </p>
                                <p>
                                    By using the Platform, you consent to the collection and use of your information as described in
                                    this Privacy Policy. If you do not agree, please discontinue use of the Platform.
                                </p>
                            </>
                        )}
                    </section>

                    <section>
                        {sectionTitle('2', 'Data We Collect')}
                        {subHeading('2.1 Information You Provide Directly')}
                        {body(
                            <ul className="list-disc pl-5 space-y-2">
                                <li>
                                    <strong>Identity Information:</strong> Full name, company name (for B2B), job title, and
                                    designation.
                                </li>
                                <li>
                                    <strong>Contact Information:</strong> Email address, phone number, and billing/delivery address.
                                </li>
                                <li>
                                    <strong>Account Information:</strong> Username, password (stored in encrypted form), and account
                                    preferences.
                                </li>
                                <li>
                                    <strong>Order Information:</strong> RFQ details, design files, specifications, order history,
                                    and communication records.
                                </li>
                                <li>
                                    <strong>Payment Information:</strong> Transaction reference numbers, payment method type. Note:
                                    We do not store full credit/debit card numbers. Payment processing is handled by PCI-DSS compliant
                                    third-party payment gateways.
                                </li>
                                <li>
                                    <strong>Communication Data:</strong> Queries, feedback, and correspondence submitted via contact
                                    forms, email, or support channels.
                                </li>
                            </ul>
                        )}
                        {subHeading('2.2 Information Collected Automatically')}
                        {body(
                            <ul className="list-disc pl-5 space-y-2">
                                <li>
                                    <strong>Device and Technical Data:</strong> IP address, browser type and version, operating
                                    system, device identifiers, and screen resolution.
                                </li>
                                <li>
                                    <strong>Usage Data:</strong> Pages visited, time spent on the Platform, links clicked, file
                                    upload activity, and referring URLs.
                                </li>
                                <li>
                                    <strong>Cookie Data:</strong> Session cookies, preference cookies, and analytics cookies (see
                                    Section 7).
                                </li>
                            </ul>
                        )}
                        {subHeading('2.3 Information from Third Parties')}
                        {body(
                            <p>
                                We may receive information about you from third-party sources such as payment gateways, logistics
                                partners, and business verification services, which we combine with information we already hold to
                                improve service delivery and prevent fraud.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('3', 'How We Use Your Data')}
                        {body(
                            <>
                                <p>
                                    We use your personal information for the following purposes, which constitute lawful bases under
                                    applicable Indian data protection law:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>
                                        <strong>Order Fulfilment:</strong> To process RFQs, confirm orders, manufacture and dispatch
                                        products, and communicate order status updates.
                                    </li>
                                    <li>
                                        <strong>Account Management:</strong> To create and manage your user account, authenticate
                                        your identity, and enable access to our services.
                                    </li>
                                    <li>
                                        <strong>Payments and Invoicing:</strong> To process payments, issue GST-compliant invoices,
                                        and manage refunds where applicable.
                                    </li>
                                    <li>
                                        <strong>Customer Support:</strong> To respond to your queries, complaints, and refund or
                                        rework requests.
                                    </li>
                                    <li>
                                        <strong>Service Improvement:</strong> To analyse usage patterns, improve Platform
                                        functionality, and develop new features.
                                    </li>
                                    <li>
                                        <strong>Marketing and Communication:</strong> To send you order confirmations, service
                                        updates, promotional offers, and newsletters. You may opt out of marketing communications at
                                        any time.
                                    </li>
                                    <li>
                                        <strong>Legal and Regulatory Compliance:</strong> To fulfil obligations under the IT Act,
                                        GST laws, and other applicable Indian regulations, including responding to lawful
                                        government or court requests.
                                    </li>
                                    <li>
                                        <strong>Fraud Prevention and Security:</strong> To detect and prevent fraudulent
                                        transactions, unauthorised access, and other security threats.
                                    </li>
                                </ul>
                            </>
                        )}
                    </section>

                    <section>
                        {sectionTitle('4', 'Sensitive Personal Data or Information (SPDI)')}
                        {body(
                            <p>
                                Under the SPDI Rules, certain categories of data are treated as sensitive, including financial
                                information (such as bank account or payment card details) and passwords. 247 Cut Bend collects such
                                data only to the extent necessary for order and payment processing, obtains your explicit consent
                                before collection, and implements reasonable security practices for its protection. We do not collect
                                biometric data, health information, or data related to sexual orientation.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('5', 'Sharing Your Data with Third Parties')}
                        {body(
                            <>
                                <p>
                                    We do not sell, rent, or trade your personal information to third parties for their own marketing
                                    purposes. We share your data only in the following circumstances:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>
                                        <strong>Service Providers:</strong> With trusted third-party vendors who assist in operating
                                        the Platform and delivering services, including payment gateways, logistics and courier
                                        partners, cloud hosting providers, email service providers, and analytics platforms. These
                                        parties are contractually bound to handle data securely and solely for the purposes for which
                                        it was shared.
                                    </li>
                                    <li>
                                        <strong>Legal Requirements:</strong> Where required by applicable law, court order, or
                                        government authority, including the Enforcement Directorate, Serious Fraud Investigation
                                        Office, or other regulatory bodies.
                                    </li>
                                    <li>
                                        <strong>Business Transfers:</strong> In connection with a merger, acquisition, restructuring,
                                        or sale of assets, in which case your data may be transferred to the succeeding entity,
                                        subject to the same privacy protections.
                                    </li>
                                    <li>
                                        <strong>Consent-Based Sharing:</strong> Where you have provided explicit consent for a
                                        specific sharing purpose.
                                    </li>
                                </ul>
                            </>
                        )}
                    </section>

                    <section>
                        {sectionTitle('6', 'Data Retention')}
                        {body(
                            <>
                                <p>
                                    We retain your personal data for as long as necessary to fulfil the purposes for which it was
                                    collected, including:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>
                                        <strong>Account Data:</strong> For the duration of your account&apos;s active status, plus 5
                                        years after closure, as required for legal and audit compliance.
                                    </li>
                                    <li>
                                        <strong>Order and Financial Records:</strong> A minimum of eight (8) years, as required
                                        under the Income Tax Act, 1961, and GST laws.
                                    </li>
                                    <li>
                                        <strong>Communication Records:</strong> Up to three (3) years from the date of last
                                        interaction.
                                    </li>
                                </ul>
                                <p>
                                    Upon expiry of the applicable retention period, we will securely delete or anonymise your
                                    personal data.
                                </p>
                            </>
                        )}
                    </section>

                    <section>
                        {sectionTitle('7', 'Cookies and Tracking Technologies')}
                        {body(
                            <>
                                <p>
                                    Our Platform uses cookies and similar tracking technologies to enhance your experience. The
                                    types of cookies we use include:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>
                                        <strong>Essential Cookies:</strong> Necessary for the Platform to function correctly (e.g.,
                                        session management, login authentication). These cannot be disabled.
                                    </li>
                                    <li>
                                        <strong>Preference Cookies:</strong> Remember your language, region, and other customisation
                                        settings.
                                    </li>
                                    <li>
                                        <strong>Analytics Cookies:</strong> Collect aggregated, anonymised data about how visitors use
                                        the Platform (e.g., Google Analytics). This helps us improve content and navigation.
                                    </li>
                                    <li>
                                        <strong>Marketing Cookies:</strong> Used to deliver relevant promotional content. These are
                                        only set with your consent.
                                    </li>
                                </ul>
                                <p>
                                    You can manage or disable non-essential cookies through your browser settings or via the cookie
                                    preference centre on our Platform. Note that disabling certain cookies may affect Platform
                                    functionality.
                                </p>
                            </>
                        )}
                    </section>

                    <section>
                        {sectionTitle('8', 'Data Security')}
                        {body(
                            <>
                                <p>
                                    247 Cut Bend implements reasonable technical and organisational security measures to protect your
                                    personal data from unauthorised access, disclosure, alteration, or destruction. These include:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>SSL/TLS encryption for all data transmitted between your browser and our servers.</li>
                                    <li>Encrypted storage of passwords and sensitive credentials.</li>
                                    <li>Access controls and role-based permissions for internal data access.</li>
                                    <li>Regular security audits and vulnerability assessments.</li>
                                </ul>
                                <p>
                                    Notwithstanding these measures, no data transmission over the internet or method of electronic
                                    storage is 100% secure. In the event of a personal data breach that poses a risk to your rights
                                    and interests, we will notify you and the relevant authorities in accordance with applicable law.
                                </p>
                            </>
                        )}
                    </section>

                    <section>
                        {sectionTitle('9', 'Your Rights')}
                        {body(
                            <>
                                <p>Subject to applicable Indian law, you have the following rights with respect to your personal data:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>
                                        <strong>Right to Access:</strong> Request a copy of the personal data we hold about you.
                                    </li>
                                    <li>
                                        <strong>Right to Correction:</strong> Request correction of inaccurate or incomplete data.
                                    </li>
                                    <li>
                                        <strong>Right to Erasure:</strong> Request deletion of your personal data, subject to legal
                                        retention obligations.
                                    </li>
                                    <li>
                                        <strong>Right to Withdraw Consent:</strong> Withdraw consent for data processing at any time,
                                        where processing is based on consent. Withdrawal does not affect the lawfulness of prior
                                        processing.
                                    </li>
                                    <li>
                                        <strong>Right to Grievance Redressal:</strong> Lodge a complaint about our data practices.
                                    </li>
                                </ul>
                                <p>
                                    To exercise any of these rights, please contact our Data Grievance Officer at{' '}
                                    <a href="mailto:sales@247cutbend.in" className="text-[#2d3992] font-medium hover:underline">
                                        sales@247cutbend.in
                                    </a>
                                    . We will acknowledge your request within 48 hours and resolve it within thirty (30) days, as
                                    required under the DPDP Act framework.
                                </p>
                            </>
                        )}
                    </section>

                    <section>
                        {sectionTitle('10', 'Cross-Border Data Transfers')}
                        {body(
                            <p>
                                Our primary data hosting is within India. Where data is transferred outside India (e.g., through
                                cloud infrastructure or analytics tools), we ensure such transfers comply with applicable Indian data
                                protection laws and that adequate safeguards are in place.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('11', "Children's Privacy")}
                        {body(
                            <p>
                                The Platform is not directed at children under the age of 18. We do not knowingly collect personal
                                data from minors. If we become aware that a minor has provided us personal data without verifiable
                                parental consent, we will take steps to delete such information promptly. If you believe a child has
                                provided us data, please contact us at [Contact Email].
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('12', 'Third-Party Websites')}
                        {body(
                            <p>
                                Our Platform may contain links to third-party websites. This Privacy Policy does not apply to those
                                websites, and we encourage you to review the privacy policies of any third-party sites you visit. 247
                                Cut Bend is not responsible for the data practices of such third-party websites.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('13', 'Changes to This Privacy Policy')}
                        {body(
                            <p>
                                We may update this Privacy Policy from time to time to reflect changes in our practices, technology,
                                or applicable law. Material changes will be communicated to you via email or a prominent notice on the
                                Platform. The revised Policy will become effective upon posting. Your continued use of the Platform
                                constitutes acceptance of the updated Policy.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('14', 'Grievance Officer (Data)')}
                        {body(
                            <>
                                <p>
                                    In accordance with the Information Technology Act, 2000 and SPDI Rules, 2011, the details of our
                                    Grievance Officer are:
                                </p>
                                <ul className="list-none space-y-2 pl-0">
                                    <li>
                                        <span className="font-medium text-gray-700">Name:</span> [Grievance Officer Name]
                                    </li>
                                    <li>
                                        <span className="font-medium text-gray-700">Email:</span>{' '}
                                        <a href="mailto:sales@247cutbend.in" className="text-[#2d3992] hover:underline">
                                            sales@247cutbend.in
                                        </a>
                                    </li>
                                    <li>
                                        <span className="font-medium text-gray-700">Address:</span> 247 Cut Bend (A Rishi Laser
                                        Enterprise), 578-587 Savli GIDC Rd, Manjusar, 391770, Vadodara, Gujarat, India
                                    </li>
                                    <li>
                                        <span className="font-medium text-gray-700">Working Hours:</span> Monday to Saturday, 9:00 AM
                                        to 6:00 PM IST (excluding public holidays)
                                    </li>
                                </ul>
                                <p>
                                    Grievances will be addressed within one (1) month of receipt, in accordance with applicable law.
                                </p>
                            </>
                        )}
                    </section>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
                        <p>If you have any questions about this Privacy Policy, please contact us at sales@247cutbend.in.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
