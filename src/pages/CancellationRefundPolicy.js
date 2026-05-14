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

const CancellationRefundPolicy = () => {
    return (
        <div className="bg-gray-50">
            <div className="bg-[#2d3992] text-white px-4 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <svg width="100%" height="100%">
                        <pattern id="crp-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#crp-grid)" />
                    </svg>
                </div>

                <div className="max-w-4xl mx-auto relative z-10 text-center animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Cancellation & Refund Policy</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 pb-4">
                <div
                    className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-gray-700 leading-relaxed ring-1 ring-gray-100 animate-fade-in-up"
                    style={{ animationDelay: '0.1s' }}
                >
                    <div className="space-y-10">
                    <section>
                        {sectionTitle('1', 'Overview')}
                        {body(
                            <p>
                                At 247 Cut Bend (A Rishi Laser Enterprise), we are committed to delivering precision-fabricated
                                parts that meet your exact specifications. Because all our products are custom-manufactured to
                                order, our cancellation and refund policy reflects the unique nature of bespoke fabrication
                                services. We encourage all customers to review their order details, design files, and
                                specifications carefully before placing an order.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('2', 'Cancellation Policy')}
                        {subHeading('2.1 Cancellation Window')}
                        {body(
                            <>
                                <p>
                                    Given our rapid manufacturing turnaround with production commencing within hours of order
                                    confirmation, cancellation is subject to the following conditions:
                                </p>
                                <p>
                                    <strong>Full Cancellation (100% Refund):</strong> You may cancel your confirmed order without
                                    penalty within two (2) hours of order confirmation, provided production has not yet commenced.
                                    Cancellation requests must be submitted via email to{' '}
                                    <a href="mailto:sales@247cutbend.in" className="text-[#2d3992] font-medium hover:underline">
                                        sales@247cutbend.in
                                    </a>{' '}
                                    with the subject line &quot;Order Cancellation – [Order ID]&quot;.
                                </p>
                                <p>
                                    <strong>Partial Cancellation (After Production Commencement):</strong> Once production has
                                    begun, cancellation will not be accepted, and no refund shall be issued. You will be notified
                                    via email when your order enters production.
                                </p>
                                <p>
                                    <strong>B2B Clients:</strong> Business customers with purchase orders governed by a separate
                                    written agreement should refer to the cancellation terms in that agreement. In the absence of a
                                    written agreement, this Policy applies.
                                </p>
                            </>
                        )}
                        {subHeading('2.2 How to Request Cancellation')}
                        {body(
                            <>
                                <ol className="list-decimal pl-5 space-y-3">
                                    <li>
                                        Log in to your account on{' '}
                                        <a
                                            href="https://247cutbend.in/login"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#2d3992] font-medium hover:underline break-all"
                                        >
                                            https://247cutbend.in/login
                                        </a>{' '}
                                        and navigate to &quot;My Orders.&quot;
                                    </li>
                                    <li>Select the order you wish to cancel and click &quot;Request Cancellation.&quot;</li>
                                    <li>
                                        Alternatively, email{' '}
                                        <a href="mailto:sales@247cutbend.in" className="text-[#2d3992] font-medium hover:underline">
                                            sales@247cutbend.in
                                        </a>{' '}
                                        with your Order ID, registered email address, and reason for cancellation.
                                    </li>
                                    <li>Our team will acknowledge your request within four (4) business hours.</li>
                                    <li>Upon successful verification, you will receive a Cancellation Confirmation via email.</li>
                                </ol>
                            </>
                        )}
                    </section>

                    <section>
                        {sectionTitle('3', 'Refund Policy')}
                        {subHeading('3.1 Grounds for Refund')}
                        {body(
                            <>
                                <p>A refund or rework shall be offered in the following circumstances:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>
                                        <strong>Manufacturing Defect:</strong> The fabricated parts are materially non-conformant
                                        to the agreed specifications (e.g., incorrect dimensions, material, or finish), as
                                        determined by our quality team.
                                    </li>
                                    <li>
                                        <strong>Order Cancellation Within Window:</strong> As described in Section 2.1 above.
                                    </li>
                                    <li>
                                        <strong>Non-Delivery:</strong> If your order is confirmed as lost in transit and a
                                        replacement cannot be arranged within a reasonable timeframe.
                                    </li>
                                    <li>
                                        <strong>Duplicate Payment:</strong> In the event of a technical error resulting in a
                                        duplicate charge.
                                    </li>
                                </ul>
                            </>
                        )}
                        {subHeading('3.2 Grounds for Non-Refund / Exceptions')}
                        {body(
                            <>
                                <p>Refunds will NOT be issued in the following circumstances:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>
                                        Errors in design files uploaded by the Customer, where the fabricated product conforms to the
                                        uploaded specifications.
                                    </li>
                                    <li>Change of mind after production has commenced.</li>
                                    <li>
                                        Minor cosmetic variations inherent to the laser cutting or bending process that do not
                                        affect functionality.
                                    </li>
                                    <li>Damage caused during installation or post-delivery handling by the Customer.</li>
                                    <li>
                                        Orders for which material procurement has been initiated, where cancellation is attempted
                                        outside the two-hour window.
                                    </li>
                                    <li>
                                        Custom or special-material orders where the material has already been sourced or procured.
                                    </li>
                                </ul>
                            </>
                        )}
                        {subHeading('3.3 Rework Policy')}
                        {body(
                            <p>
                                As an alternative to a refund, 247 Cut Bend will, at its option and subject to quality
                                inspection, offer a free rework of non-conformant parts. Rework shall be initiated within
                                forty-eight (48) business hours of receipt of returned parts. The Customer shall be responsible
                                for returning the non-conformant parts to our facility in Vadodara; 247 Cut Bend will cover the
                                shipping cost of the reworked replacement.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('4', 'Refund Request Process')}
                        {body(
                            <ol className="list-decimal pl-5 space-y-3">
                                <li>
                                    Submit a refund request within forty-eight (48) hours of delivery by emailing{' '}
                                    <a href="mailto:sales@247cutbend.in" className="text-[#2d3992] font-medium hover:underline">
                                        sales@247cutbend.in
                                    </a>{' '}
                                    with the subject line &quot;Refund Request – [Order ID]&quot;.
                                </li>
                                <li>Attach clear photographs or videos evidencing the defect or non-conformance.</li>
                                <li>Our quality team will inspect the claim and respond within three (3) business days with a decision.</li>
                                <li>If the claim is approved, you will be issued a Return Merchandise Authorisation (RMA) number.</li>
                                <li>
                                    Return the parts to our facility using the RMA number. Do not return parts without an RMA
                                    number, as such returns will not be accepted.
                                </li>
                                <li>Upon receipt and verification of the returned parts, the refund or rework will be initiated.</li>
                            </ol>
                        )}
                    </section>

                    <section>
                        {sectionTitle('5', 'Refund Processing and Timelines')}
                        {body(
                            <>
                                <p>Approved refunds will be processed as follows:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>
                                        <strong>Payment Mode – UPI / Net Banking:</strong> Refund credited to the source account
                                        within five (5) to seven (7) business days from refund approval.
                                    </li>
                                    <li>
                                        <strong>Payment Mode – Credit / Debit Card:</strong> Refund credited within seven (7) to ten
                                        (10) business days, subject to the card-issuing bank&apos;s processing timeline.
                                    </li>
                                    <li>
                                        <strong>B2B Advance Payments:</strong> Refund via NEFT/RTGS within three (3) to five (5)
                                        business days.
                                    </li>
                                </ul>
                                <p>
                                    247 Cut Bend shall not be responsible for delays attributable to the payment gateway, bank
                                    processing times, or bank holidays.
                                </p>
                            </>
                        )}
                    </section>

                    <section>
                        {sectionTitle('6', 'Advance Payment Terms')}
                        {body(
                            <>
                                <p>
                                    247 Cut Bend operates on an advance payment model to enable our rapid turnaround guarantee.
                                    For standard orders, a 100% of the order value is required at the time of order confirmation,
                                    with the balance due prior to dispatch. For large or custom-material orders, 100% advance may be
                                    required, as communicated in the quotation.
                                </p>
                                <p>
                                    Advance payments are held securely and applied to the respective order. In the event of an
                                    approved cancellation, the advance amount will be refunded net of any material procurement costs
                                    incurred.
                                </p>
                            </>
                        )}
                    </section>

                    <section>
                        {sectionTitle('7', 'Consumer Rights')}
                        {body(
                            <p>
                                This Policy is in addition to, and does not limit, your rights as a consumer under the Consumer
                                Protection Act, 2019, and any other applicable Indian consumer protection legislation. If you
                                believe your consumer rights have been violated, you may file a complaint with the relevant
                                consumer forum or the National Consumer Helpline.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('8', 'Grievance Redressal')}
                        {body(
                            <>
                                <p>If you are not satisfied with the resolution provided under this Policy, you may escalate your concern to:</p>
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
                                        <span className="font-medium text-gray-700">Response Time:</span> Within 15 days of receipt
                                        of grievance, as required under the Consumer Protection (E-Commerce) Rules, 2020.
                                    </li>
                                </ul>
                            </>
                        )}
                    </section>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
                        <p>For questions about this policy, contact us at sales@247cutbend.in.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CancellationRefundPolicy;
