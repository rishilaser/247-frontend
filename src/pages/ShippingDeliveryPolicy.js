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

const ShippingDeliveryPolicy = () => {
    return (
        <div className="bg-gray-50">
            <div className="bg-[#2d3992] text-white px-4 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <svg width="100%" height="100%">
                        <pattern id="sdp-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#sdp-grid)" />
                    </svg>
                </div>

                <div className="max-w-4xl mx-auto relative z-10 text-center animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Shipping & Delivery Policy</h1>
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
                                247 Cut Bend is built on a promise of speed. Our 24–48 hour delivery commitment is central to what
                                we do—from the moment your order is confirmed to the moment your precision-fabricated parts reach
                                your facility. This Shipping & Delivery Policy outlines how we process, pack, and dispatch your
                                orders, and what you can expect at every step.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('2', 'Order Processing and Production Timeline')}
                        {subHeading('2.1 Processing Time')}
                        {body(
                            <>
                                <p>
                                    Upon order confirmation (receipt of advance payment and design file approval), your order enters
                                    our production queue. Production typically commences within one (1) to four (4) business hours
                                    of confirmation, depending on current queue capacity. Our standard production time is:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Simple laser-cut parts: 4 to 12 hours.</li>
                                    <li>Bending or multi-operation parts: 8 to 24 hours.</li>
                                    <li>Fabricated Parts: Estimated timeline communicated in your quotation.</li>
                                </ul>
                            </>
                        )}
                        {subHeading('2.2 Business Hours')}
                        {body(
                            <p>
                                Our manufacturing facility in Vadodara, Gujarat operates Monday to Saturday, 9:00 AM to 7:00 PM IST.
                                Orders confirmed after 4:00 PM IST may begin production the following business day. Orders placed on
                                public holidays will be processed on the next business day.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('3', 'Shipping Within India')}
                        {subHeading('3.1 Dispatch Timelines')}
                        {body(
                            <p>
                                247 Cut Bend aims to dispatch all completed orders within twenty-four (24) to forty-eight (48) hours
                                of order confirmation, subject to production complexity and order volume. A dispatch confirmation
                                email with tracking details will be sent to your registered email address at the time of dispatch.
                            </p>
                        )}
                        {subHeading('3.2 Logistics Partners')}
                        {body(
                            <p>
                                We partner with reputed third-party logistics and courier service providers to ensure safe and timely
                                delivery across India, including but not limited to [Logistics Partner Name(s)]. The logistics partner
                                assigned to your shipment will be communicated in the dispatch confirmation email.
                            </p>
                        )}
                        {subHeading('3.3 Delivery Estimates by Zone')}
                        {body(
                            <>
                                <p>Estimated delivery timelines from date of dispatch are as follows (business days):</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Vadodara & 100 Km Radius: Next business day.</li>
                                    <li>Metro & Tier 1 Cities: 3 business days.</li>
                                    <li>Tier-2 and Tier-3 Cities: 5 business days.</li>
                                </ul>
                                <p>
                                    These are estimates only and are not guaranteed delivery dates. Actual delivery times may vary
                                    due to weather, strikes, public holidays, or logistics partner constraints. For urgent
                                    deliveries, expedited shipping options may be available—please enquire at{' '}
                                    <a href="mailto:sales@247cutbend.in" className="text-[#2d3992] font-medium hover:underline">
                                        sales@247cutbend.in
                                    </a>{' '}
                                    before placing your order.
                                </p>
                            </>
                        )}
                        {subHeading('3.4 Shipping Charges')}
                        {body(
                            <p>
                                Shipping charges are calculated based on the weight, dimensions, and delivery destination of your
                                order, and will be clearly indicated at checkout prior to payment confirmation. Minimum shipping
                                charges and any applicable remote area surcharges will be displayed transparently. Shipping charges
                                are non-refundable unless the return is due to a defect or error on our part.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('4', 'Packaging')}
                        {body(
                            <p>
                                All fabricated parts are carefully packed to prevent damage during transit. Metal parts are
                                individually wrapped and secured in rigid packaging with appropriate cushioning. For bulk or heavy
                                shipments, industrial palletising or crating may be used. If you have specific packaging
                                requirements, please communicate them at the time of placing your order, as custom packaging may
                                attract additional charges.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('5', 'Shipment Tracking')}
                        {body(
                            <>
                                <p>
                                    Once your order is dispatched, you will receive a tracking number and a link to the logistics
                                    partner&apos;s tracking portal via email and/or SMS. You can also track your order by:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>
                                        Logging in to your account on{' '}
                                        <a
                                            href="https://247cutbend.in"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#2d3992] font-medium hover:underline"
                                        >
                                            247cutbend.in
                                        </a>{' '}
                                        and navigating to &quot;My Orders.&quot;
                                    </li>
                                    <li>
                                        Contact our support team at{' '}
                                        <a href="mailto:sales@247cutbend.in" className="text-[#2d3992] font-medium hover:underline">
                                            sales@247cutbend.in
                                        </a>{' '}
                                        with your Order ID.
                                    </li>
                                </ul>
                                <p>
                                    We recommend tracking your shipment regularly once dispatched. If your tracking information has
                                    not been updated within 48 hours of the expected delivery date, please contact us immediately.
                                </p>
                            </>
                        )}
                    </section>

                    <section>
                        {sectionTitle('6', 'Delivery Attempts and Undelivered Shipments')}
                        {body(
                            <>
                                <p>
                                    Our logistics partners will make a minimum of two (2) delivery attempts before marking a
                                    shipment as undelivered. You will be notified via SMS or email before each attempt. If a
                                    shipment is returned to us due to:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>An incorrect or incomplete delivery address provided at the time of order.</li>
                                    <li>Failure to be available to receive the shipment after two delivery attempts.</li>
                                    <li>Refusal to accept delivery without valid cause.</li>
                                </ul>
                                <p>
                                    In such cases, re-dispatch will be arranged at the Customer&apos;s expense. 247 Cut Bend shall
                                    not be liable for any business losses arising from delayed delivery due to the above reasons.
                                </p>
                                <p>
                                    Please ensure that the delivery address provided is accurate and that an authorised
                                    representative is available to receive the shipment.
                                </p>
                            </>
                        )}
                    </section>

                    <section>
                        {sectionTitle('7', 'Lost or Delayed Shipments')}
                        {body(
                            <>
                                <p>If your shipment has not been delivered within the estimated delivery window and tracking shows no movement for more than 48 hours:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>
                                        Notify us at{' '}
                                        <a href="mailto:sales@247cutbend.in" className="text-[#2d3992] font-medium hover:underline">
                                            sales@247cutbend.in
                                        </a>{' '}
                                        with your Order ID and tracking number within five (5) business days of the expected
                                        delivery date.
                                    </li>
                                    <li>We will initiate an enquiry with the logistics partner within 24 hours.</li>
                                    <li>
                                        If the shipment is confirmed as lost, 247 Cut Bend will offer, at its discretion: (a)
                                        re-fabrication and re-dispatch of the order at no additional cost; or (b) a full refund of
                                        the order value and shipping charges.
                                    </li>
                                </ul>
                                <p>
                                    Claims for lost shipments must be raised within thirty (30) days of the original estimated
                                    delivery date. Claims raised after this period will not be entertained.
                                </p>
                            </>
                        )}
                    </section>

                    <section>
                        {sectionTitle('8', 'Damaged Shipments')}
                        {body(
                            <>
                                <p>In the unlikely event that your order is received in a physically damaged condition:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Do not discard the original packaging; retain it for inspection.</li>
                                    <li>Photograph the outer packaging and the damaged parts clearly before unpacking further.</li>
                                    <li>
                                        Report the damage to us within 48 hours of delivery at{' '}
                                        <a href="mailto:sales@247cutbend.in" className="text-[#2d3992] font-medium hover:underline">
                                            sales@247cutbend.in
                                        </a>{' '}
                                        with photographs and your Order ID.
                                    </li>
                                    <li>Our team will review the claim and respond within two (2) business days.</li>
                                    <li>
                                        Approved claims will result in replacement parts being fabricated and dispatched, or a refund
                                        at our discretion.
                                    </li>
                                </ul>
                                <p>
                                    Damage claims raised more than 48 hours after delivery will not be accepted, as we are unable to
                                    determine whether the damage occurred in transit or post-delivery.
                                </p>
                            </>
                        )}
                    </section>

                    <section>
                        {sectionTitle('9', 'Title and Risk')}
                        {body(
                            <p>
                                Title and risk in the goods pass to the Customer upon delivery to the address specified at the time
                                of order. From the point of dispatch, risk is covered under the logistics partner&apos;s applicable
                                transit insurance, where available. For high-value B2B orders, we recommend arranging additional
                                cargo insurance—please enquire at the time of order.
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('10', 'GST on Shipping')}
                        {body(
                            <p>
                                Shipping charges are subject to Goods and Services Tax (GST) at the applicable rate. GST on shipping
                                will be indicated separately in your invoice for transparency and input credit purposes (applicable
                                to B2B customers registered under GST).
                            </p>
                        )}
                    </section>

                    <section>
                        {sectionTitle('11', 'Contact for Shipping Queries')}
                        {body(
                            <>
                                <p>For all shipping-related queries, please contact our logistics support team:</p>
                                <ul className="list-none space-y-2 pl-0">
                                    <li>
                                        <span className="font-medium text-gray-700">Email:</span>{' '}
                                        <a href="mailto:sales@247cutbend.in" className="text-[#2d3992] hover:underline">
                                            sales@247cutbend.in
                                        </a>
                                    </li>
                                    <li>
                                        <span className="font-medium text-gray-700">Phone:</span>{' '}
                                        <a href="tel:+919004073379" className="text-[#2d3992] hover:underline">
                                            +919004073379
                                        </a>
                                    </li>
                                    <li>
                                        <span className="font-medium text-gray-700">Business Hours:</span> Monday to Saturday, 9:00
                                        AM to 6:00 PM IST
                                    </li>
                                </ul>
                                <p>Please include your Order ID in all shipping-related communications for faster resolution.</p>
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

export default ShippingDeliveryPolicy;
