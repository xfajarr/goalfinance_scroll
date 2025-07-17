
import Navigation from '@/components/Navigation';
import BottomNavigation from '@/components/BottomNavigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ = () => {
  const faqs = [
    {
      question: "What is GoalPay?",
      answer: "GoalPay is a decentralized savings platform that allows you to create and join shared savings goals with friends, family, or community members. Earn yield while saving together!"
    },
    {
      question: "How does GoalPay work?",
      answer: "Create a vault, set a goal amount and deadline, invite members, and start saving! Funds are locked in a smart contract and earn yield. If the goal is reached by the deadline, everyone receives their contribution + yield. If not, contributions are returned."
    },
    {
      question: "What are the benefits of saving with GoalPay?",
      answer: "Earn yield on your savings, stay motivated with shared goals, build community, and achieve financial success together!"
    },
    {
      question: "Is GoalPay secure?",
      answer: "Yes, GoalPay uses audited smart contracts and decentralized technology to ensure the security of your funds."
    },
    {
      question: "What cryptocurrencies does GoalPay support?",
      answer: "Currently, GoalPay supports saving in USDC on the Ethereum network. More cryptocurrencies and networks will be added soon!"
    },
    {
      question: "How do I create a vault?",
      answer: "Go to the Dashboard and click 'Create Vault'. Fill out the form with your goal details, set privacy settings, and invite members."
    },
    {
      question: "How do I join a vault?",
      answer: "If the vault is public, you can find it on the Community page. If you have an invite link, click the link to join."
    },
    {
      question: "What happens if we don't reach the goal?",
      answer: "If the goal is not reached by the deadline, all contributions are automatically returned to the members."
    },
    {
      question: "Are there any fees for using GoalPay?",
      answer: "GoalPay charges a small fee on the yield earned to support the platform's development and maintenance."
    },
    {
      question: "How do I withdraw my funds?",
      answer: "If the goal is reached, your funds (contribution + yield) will be automatically sent to your connected wallet after the deadline. If the goal is not reached, your contribution will be returned."
    }
  ];

  return (
    <div className="min-h-screen bg-goal-bg pb-20 md:pb-0">
      <Navigation />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-fredoka font-bold text-goal-text mb-4">
            Frequently Asked Questions
          </h1>
          <p className="font-inter text-goal-text/70">
            Everything you need to know about saving together with GoalPay
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-white/60 backdrop-blur-sm border-goal-border/30 rounded-3xl px-6 py-2"
            >
              <AccordionTrigger className="font-fredoka font-semibold text-goal-text text-lg hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="font-inter text-goal-text/70 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default FAQ;
