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

const TermsAndConditions = () => {
    return (
        <div className="bg-gray-50">
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
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 pb-4">
                <div
                    className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-gray-700 leading-relaxed ring-1 ring-gray-100 animate-fade-in-up"
                    style={{ animationDelay: '0.1s' }}
                >
                    <div className="space-y-10">
                    <section>
                        {sectionTitle('1', 'Introduction and Acceptance of Terms')}
                        {body(
                            <>
                                <p>
                                    Welcome to 247 Cut Bend, a Rishi Laser Enterprise. By accessing or using our website at{' '}
                                    [Website URL] (&quot;the Platform&quot;), submitting a Request for Quotation (RFQ), placing any
                                    order, or engaging with any service offered by 247 Cut Bend (&quot;Company,&quot; &quot;we,&quot;
                                    &quot;us,&quot; or &quot;our&quot;), you (&quot;User,&quot; &quot;Customer,&quot; &quot;you&quot;)
                                    agree to be legally bound by these Terms & Conditions (&quot;Terms&quot;). If you do not agree
                                    with any part of these Terms, you must discontinue use of the Platform immediately.
                                </p>
                                <p>
                                    These Terms constitute a legally binding agreement between you and 247 Cut Bend, governed by the
                                    laws of India. These Terms apply to all visitors, registered users, B2C customers, and B2B
                                    clients.
                                </p>
                            </>
                        )}
                    </section>

                    <section>
                        {sectionTitle('2', 'Eligibility')}
                        {body(
                            <>
                                <p>To access and use our Platform and services, you must:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>
                                        Be at least 18 years of age, or the legal age of majority in your jurisdiction, whichever is
                                        higher.
                                    </li>
                                    <li>Have the legal capacity and authority to enter into a binding contract under applicable Indian law.</li>
                                    <li>If acting on behalf of a business entity, be duly authorised to bind that entity to these Terms.</li>
                                    <li>Not be barred from receiving services under applicable Indian laws or regulations.</li>
                                </ul>
                                <p>
                                    By using the Platform, you represent and warrant that you meet all of the above eligibility
                                    criteria.
                                </p>
                            </>
                        )}
                    </section>

                    <section>
                        {sectionTitle('3', 'Platform Access and User Obligations')}
                        {subHeading('3.1 Account Registration')}
                        {body(
                            <p>
                                Certain features of the Platform may require you to create an account. You agree to: (a) provide
                                accurate, complete, and current information during registration; (b) maintain and promptly update your
                                account information; (c) keep your login credentials confidential; and (d) notify us immediately at{' '}
                                [Contact Email] of any unauthorized access to or use of your account. 247 Cut Bend shall not be liable
                                for any loss arising from your failure to comply with these obligations.
                            </p>
                        )}
                        {subHeading('3.2 Prohibited Conduct')}
                        {body(
                            <>
                                <p>While using the Platform, you must not:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Use the Platform for any unlawful, fraudulent, or malicious purpose.</li>
                                    <li>Upload or transmit any viruses, malware, or other harmful code.</li>
                                    <li>Attempt to gain unauthorised access to any part of the Platform or its servers.</li>
                                    <li>Reverse engineer, decompile, or disassemble any part of the Platform.</li>
                                    <li>Use automated scripts, bots, or scraping tools without prior written consent.</li>
                                    <li>Infringe upon any intellectual property rights of 247 Cut Bend or third parties.</li>
                                    <li>Misrepresent your identity or impersonate any person or organisation.</li>
                                    <li>Engage in any conduct that disrupts, overloads, or impairs the functioning of the Platform.</li>
                                </ul>
                            </>
                        )}
                    </section>

                    <section>
                        {sectionTitle('4', 'Orders, Quotations, and Pricing')}
                        {subHeading('4.1 RFQ Process')}
                        {body(
                            <p>
                                Our Platform allows you to submit a Request for Quotation (RFQ) by uploading your design files. All
                                RFQs are reviewed by our team, and quotations are provided within three (3) business hours during
                                operational hours. Submission of an RFQ does not constitute a binding order or commitment on the part
                                of 247 Cut Bend.
                            </p>
                        )}
                        {subHeading('4.2 Order Confirmation')}
                        {body(
                            <p>
                                An order is deemed confirmed only upon: (a) your acceptance of the issued quotation; (b) successful
                                payment of the applicable advance or full order amount as specified at checkout; and (c) issuance of
                                an Order Confirmation by 247 Cut Bend via email. 247 Cut Bend reserves the right to cancel or decline
                                any order at its sole discretion, in which case any advance payment received will be refunded in full.
                            </p>
                        )}
                        {subHeading('4.3 Pricing and Taxes')}
                        {body(
                            <p>
                                All prices displayed on the Platform are in Indian Rupees (INR) and are exclusive of Goods and
                                Services Tax (GST) and any applicable levies, unless expressly stated otherwise. Applicable taxes will
                                be added at checkout. Prices are subject to change without notice and are valid only at the time of
                                quotation issuance.
                            </p>
                        )}
                        {subHeading('4.4 Custom Fabrication')}
                        {body(
                            <p>
                                All products fabricated by 247 Cut Bend are custom-made to your specifications. By submitting a design
                                file and confirming an order, you represent and warrant that: (a) you own or have the necessary rights
                                and licences to use the design; (b) the design does not infringe any third-party intellectual property
                                rights; and (c) the intended use of the fabricated parts complies with all applicable laws.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('5', 'Payment Terms')}
                        {body(
                            <>
                                <p>
                                    Payment for all orders must be made through the payment methods accepted on the Platform at the
                                    time of checkout. We currently accept NEFT, RTGS, UPI, and such other modes as may be listed on
                                    the Platform. Orders are processed only after payment is received and confirmed. For B2B clients,
                                    credit terms may be offered subject to a separate written agreement with 247 Cut Bend management.
                                </p>
                                <p>
                                    In the event of a payment failure or chargeback not attributable to 247 Cut Bend, we reserve the
                                    right to suspend fulfilment of the relevant order pending resolution. All payment disputes must be
                                    raised within seven (7) days of the transaction date.
                                </p>
                            </>
                        )}
                    </section>

                    <section>
                        {sectionTitle('6', 'Intellectual Property')}
                        {subHeading('6.1 Platform Content')}
                        {body(
                            <p>
                                All content on the Platform, including but not limited to text, graphics, logos, icons, images, data
                                compilations, software, and underlying source code (&quot;Platform Content&quot;), is the exclusive
                                property of 247 Cut Bend or its licensors, and is protected by applicable Indian copyright, trademark,
                                and other intellectual property laws.
                            </p>
                        )}
                        {subHeading('6.2 Licence to Use')}
                        {body(
                            <p>
                                Subject to your compliance with these Terms, 247 Cut Bend grants you a limited, non-exclusive,
                                non-transferable, revocable licence to access and use the Platform solely for your personal or
                                internal business purposes of procuring fabrication services. This licence does not permit you to:
                                reproduce, distribute, modify, create derivative works of, publicly display, or commercially exploit
                                any Platform Content without prior written consent from 247 Cut Bend.
                            </p>
                        )}
                        {subHeading('6.3 User-Submitted Content')}
                        {body(
                            <p>
                                By uploading design files or any other materials to the Platform (&quot;User Content&quot;), you grant
                                247 Cut Bend a limited, royalty-free licence to use such content solely for the purpose of fulfilling
                                your order. You retain all ownership rights in your User Content. 247 Cut Bend will not share your
                                design files with third parties except as required for manufacturing, logistics, or as required by
                                law. For more information, refer to our Privacy Policy.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('7', 'Warranties and Disclaimer')}
                        {subHeading('7.1 Our Warranty')}
                        {body(
                            <p>
                                247 Cut Bend warrants that fabricated products will conform materially to the agreed specifications
                                at the time of delivery. In the event of a non-conformance, your sole remedy is repair, rework, or
                                replacement as per our Cancellation & Refund Policy.
                            </p>
                        )}
                        {subHeading('7.2 Disclaimer')}
                        {body(
                            <p>
                                EXCEPT AS EXPRESSLY PROVIDED IN SECTION 7.1, THE PLATFORM AND ALL SERVICES ARE PROVIDED &quot;AS
                                IS&quot; AND &quot;AS AVAILABLE,&quot; WITHOUT ANY WARRANTY OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR
                                STATUTORY, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT,
                                OR UNINTERRUPTED, ERROR-FREE SERVICE. 247 Cut Bend does not warrant that the Platform will meet your
                                specific requirements, or that information on the Platform is accurate, complete, or current.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('8', 'Limitation of Liability')}
                        {body(
                            <>
                                <p>
                                    To the maximum extent permitted under applicable Indian law, 247 Cut Bend, its directors,
                                    employees, affiliates, agents, and licensors shall not be liable for: (a) any indirect, incidental,
                                    consequential, special, or exemplary damages; (b) loss of profit, revenue, data, goodwill, or
                                    business opportunities; or (c) any damages arising from your reliance on information obtained
                                    through the Platform.
                                </p>
                                <p>
                                    In all events, 247 Cut Bend&apos;s aggregate liability to you for any claim arising out of or
                                    relating to these Terms or your use of the Platform shall not exceed the total amount paid by you
                                    for the specific order giving rise to the claim in the preceding six (6) months.
                                </p>
                                <p>
                                    Nothing in these Terms shall limit or exclude liability for death or personal injury caused by
                                    negligence, fraud, or any other liability that cannot be excluded under applicable law.
                                </p>
                            </>
                        )}
                    </section>

                    <section>
                        {sectionTitle('9', 'Indemnification')}
                        {body(
                            <p>
                                You agree to indemnify, defend, and hold harmless 247 Cut Bend and its officers, directors,
                                employees, agents, and successors from and against any claims, damages, losses, liabilities, costs,
                                and expenses (including reasonable legal fees) arising out of or in connection with: (a) your use of
                                the Platform; (b) your breach of these Terms; (c) your violation of any applicable law or third-party
                                rights; or (d) your User Content.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('10', 'Third-Party Links and Services')}
                        {body(
                            <p>
                                The Platform may contain links to third-party websites or services. 247 Cut Bend does not endorse,
                                control, or take responsibility for the content, policies, or practices of any third-party sites or
                                services. Your interactions with such third parties are solely between you and them, and 247 Cut Bend
                                shall not be a party to any dispute arising therefrom.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('11', 'Governing Law and Dispute Resolution')}
                        {body(
                            <>
                                <p>
                                    These Terms shall be governed by and construed in accordance with the laws of India. Any dispute,
                                    controversy, or claim arising out of or in connection with these Terms, including their validity,
                                    breach, or termination, shall first be attempted to be resolved through good-faith negotiations
                                    between the parties.
                                </p>
                                <p>
                                    If such negotiations fail within thirty (30) days, the dispute shall be subject to the exclusive
                                    jurisdiction of the courts located at Vadodara, Gujarat, India. For B2B disputes, the parties may
                                    mutually agree to refer the matter to arbitration under the Arbitration and Conciliation Act,
                                    1996, with the seat of arbitration at Vadodara, Gujarat, India.
                                </p>
                            </>
                        )}
                    </section>

                    <section>
                        {sectionTitle('12', 'Force Majeure')}
                        {body(
                            <p>
                                247 Cut Bend shall not be liable for any failure or delay in performance caused by circumstances
                                beyond its reasonable control, including but not limited to acts of God, fire, flood, pandemic, war,
                                civil unrest, strikes, government regulations, power failures, or disruptions to telecommunications or
                                internet services. In such events, 247 Cut Bend will notify affected customers and take reasonable
                                steps to mitigate the impact.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('13', 'Amendments')}
                        {body(
                            <p>
                                247 Cut Bend reserves the right to modify, update, or replace these Terms at any time. Changes will be
                                effective upon posting to the Platform with an updated &quot;Last Updated&quot; date. Your continued
                                use of the Platform following the posting of any changes constitutes your acceptance of the revised
                                Terms. We encourage you to review these Terms periodically.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('14', 'Severability')}
                        {body(
                            <p>
                                If any provision of these Terms is found to be invalid, unlawful, or unenforceable by a court of
                                competent jurisdiction, such provision shall be deemed severed from the Terms, and the remaining
                                provisions shall continue in full force and effect.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('15', 'Entire Agreement')}
                        {body(
                            <p>
                                These Terms, together with our Privacy Policy, Cancellation & Refund Policy, and Shipping Policy,
                                constitute the entire agreement between you and 247 Cut Bend with respect to your use of the Platform
                                and supersede all prior agreements, representations, and understandings.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('16', 'Contact Information')}
                        {body(
                            <>
                                <p>
                                    For questions, concerns, or grievances relating to these Terms, please contact our Grievance
                                    Officer:
                                </p>
                                <ul className="list-none space-y-2 pl-0">
                                    <li>
                                        <span className="font-medium text-gray-700">Grievance Officer:</span> [Grievance Officer Name]
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
                                        <span className="font-medium text-gray-700">Phone:</span>{' '}
                                        <a href="tel:+919004073379" className="text-[#2d3992] hover:underline">
                                            +919004073379
                                        </a>
                                    </li>
                                </ul>
                                <p>We endeavour to respond to all queries within 48 business hours.</p>
                            </>
                        )}
                    </section>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
                        <p>If you have any questions about these Terms, please contact us.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
