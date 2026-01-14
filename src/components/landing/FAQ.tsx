import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How does the 7-day free trial work?',
    answer: 'Sign up with just your email and phone number — no credit card required. You get full access to all features for 7 days. The only limitation is that staff account creation is disabled during the trial. After 7 days, choose any plan to continue.',
  },
  {
    question: 'Can I add staff members to my pharmacy?',
    answer: 'Yes! After subscribing to any paid plan (Monthly, Yearly, or Lifetime), you can create unlimited staff accounts with customizable role-based permissions. Control exactly what each staff member can see and do.',
  },
  {
    question: 'How does the Daily Cash feature work?',
    answer: 'Daily Cash is auto-calculated based on your transactions. It tracks opening balance, adds cash from sales and due collections, deducts supplier payments and daily costs, and shows your closing balance. You can also add manual adjustments with notes.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept bKash, Nagad, and all major cards through SSLCommerz/PayStation. All payments are processed securely with bank-level encryption.',
  },
  {
    question: 'What happens if I miss a payment?',
    answer: 'Your data is never deleted. If your subscription expires, you\'ll be redirected to the billing page until payment is made. For Lifetime users, if the yearly service charge is unpaid, access is restricted but data remains safe.',
  },
  {
    question: 'Can I generate reports and share them?',
    answer: 'Absolutely! Generate beautiful PDF reports for sales, suppliers, customer dues, and daily cash. All reports show amounts in Bangladeshi Taka (৳) and can be shared via WhatsApp or Imo directly from the app.',
  },
  {
    question: 'Is my pharmacy data secure?',
    answer: 'Yes, we use bank-level encryption and security practices. Your data is stored securely in the cloud with regular backups. Only you and your authorized staff can access your pharmacy data.',
  },
  {
    question: 'Do you offer support?',
    answer: 'Yes! All plans include customer support. Monthly subscribers get priority support, and Lifetime users enjoy VIP support with faster response times. Reach us via WhatsApp, email, or phone.',
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
            <span className="text-primary text-sm font-semibold">Got Questions?</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about MedFlowx. 
            Can't find an answer? Contact our support team.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 shadow-card data-[state=open]:shadow-lg transition-all"
              >
                <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:text-primary py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
