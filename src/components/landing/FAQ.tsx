import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: '৭ দিনের ফ্রি ট্রায়াল কিভাবে কাজ করে?',
    answer: 'শুধু ইমেইল ও ফোন নম্বর দিয়ে সাইনআপ করুন — কোনো ক্রেডিট কার্ড লাগবে না। ৭ দিন সব ফিচার ব্যবহার করুন। শুধু স্টাফ অ্যাকাউন্ট তৈরি করা যাবে না। ট্রায়াল শেষে যেকোনো প্যাকেজ বেছে নিন।',
  },
  {
    question: 'আমি কি স্টাফ মেম্বার যোগ করতে পারব?',
    answer: 'হ্যাঁ! যেকোনো পেইড প্যাকেজে (মাসিক, বার্ষিক বা লাইফটাইম) আনলিমিটেড স্টাফ অ্যাকাউন্ট তৈরি করতে পারবেন। প্রতিটি স্টাফের জন্য আলাদা রোল ও পারমিশন সেট করুন।',
  },
  {
    question: 'দৈনিক ক্যাশ ফিচার কিভাবে কাজ করে?',
    answer: 'দৈনিক ক্যাশ স্বয়ংক্রিয়ভাবে হিসাব হয়। বিক্রয়, বাকি আদায়, সাপ্লায়ার পেমেন্ট এবং খরচ থেকে ওপেনিং, ইনফ্লো, আউটফ্লো এবং ক্লোজিং ব্যালেন্স দেখুন। আগের দিনের ক্লোজিং পরের দিনের ওপেনিং হিসেবে সাজেস্ট হয়।',
  },
  {
    question: 'কোন পেমেন্ট মেথড গ্রহণ করা হয়?',
    answer: 'বিকাশ, নগদ এবং সব মেজর কার্ড (এসএসএল কমার্স/পেস্টেশন)। সব পেমেন্ট ব্যাংক-লেভেল এনক্রিপশনে সুরক্ষিত।',
  },
  {
    question: 'পেমেন্ট মিস করলে কী হবে?',
    answer: 'আপনার ডাটা কখনো ডিলিট হবে না। সাবস্ক্রিপশন এক্সপায়ার হলে বিলিং পেজে রিডাইরেক্ট হবেন। পেমেন্ট করলেই সব ফিরে পাবেন। লাইফটাইম ইউজারদের সার্ভিস চার্জ বাকি থাকলে একসেস সীমিত হবে, কিন্তু ডাটা সেভ থাকবে।',
  },
  {
    question: 'রিপোর্ট জেনারেট ও শেয়ার করা যায়?',
    answer: 'অবশ্যই! বিক্রয়, সাপ্লায়ার, কাস্টমার বাকি এবং ক্যাশ ফ্লো — সব কিছুর সুন্দর PDF রিপোর্ট তৈরি করুন। সব রিপোর্ট বাংলাদেশি টাকায় (৳) এবং সরাসরি হোয়াটসঅ্যাপ বা ইমোতে শেয়ার করুন।',
  },
  {
    question: 'আমার ফার্মেসির ডাটা কি নিরাপদ?',
    answer: 'সম্পূর্ণ নিরাপদ। ব্যাংক-লেভেল এনক্রিপশন এবং সিকিউরিটি ব্যবহার করি। আপনার ডাটা নিরাপদে ক্লাউডে সংরক্ষিত এবং নিয়মিত ব্যাকআপ হয়। শুধু আপনি এবং আপনার অনুমোদিত স্টাফ একসেস পাবে।',
  },
  {
    question: 'সাপোর্ট পাওয়া যায়?',
    answer: 'হ্যাঁ! সব প্যাকেজে কাস্টমার সাপোর্ট আছে। মাসিক সাবস্ক্রাইবাররা প্রায়োরিটি সাপোর্ট এবং লাইফটাইম ইউজাররা VIP সাপোর্ট পান। হোয়াটসঅ্যাপ, ইমেইল বা ফোনে যোগাযোগ করুন।',
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
            <span className="text-primary text-sm font-semibold">প্রশ্ন আছে?</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            সচরাচর জিজ্ঞাসা
          </h2>
          <p className="text-lg text-muted-foreground">
            MedFlowx সম্পর্কে আপনার সব প্রশ্নের উত্তর।
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
