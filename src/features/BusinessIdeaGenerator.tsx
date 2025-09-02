
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Lightbulb, Download, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface BusinessIdea {
  title: string;
  description: string;
  startupSteps: string[];
  estimatedMonthlyProfit: string;
}

const BusinessIdeaGenerator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [budget, setBudget] = useState<string>("");
  const [businessType, setBusinessType] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [businessIdea, setBusinessIdea] = useState<BusinessIdea | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const generateBusinessIdea = async () => {
    if (!budget || !businessType || !location) {
      toast({
        title: "Missing Information",
        description: "Please enter your budget, select a business type, and choose your location.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI generation with realistic business ideas based on budget and type
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      const budgetNum = parseInt(budget);
      const idea = generateIdeaBasedOnInputs(budgetNum, businessType);
      setBusinessIdea(idea);
      toast({
        title: "Business Idea Generated!",
        description: "Your personalized business idea is ready.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate business idea. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateIdeaBasedOnInputs = (budget: number, type: string): BusinessIdea => {
    const ideas = {
      General: {
        low: {
          title: "Mobile Money Agent Business",
          description: "Start a mobile money transfer service in your community. With minimal investment, you can become an agent for services like MTN Mobile Money or Airtel Money, helping people send and receive money.",
          startupSteps: [
            "Register with mobile money providers (MTN, Airtel)",
            "Find a strategic location with high foot traffic",
            "Set up a small kiosk or counter space",
            "Build relationships with regular customers",
            "Maintain proper cash flow and records"
          ],
          estimatedMonthlyProfit: "50,000 - 150,000 RWF"
        },
        high: {
          title: "Import & Distribution Business",
          description: "Import popular consumer goods from neighboring countries and distribute them to retailers across Rwanda. Focus on high-demand items like electronics, clothing, or household goods.",
          startupSteps: [
            "Research market demand and identify profitable products",
            "Establish supplier relationships in Uganda/Kenya/Tanzania",
            "Register your import business and obtain necessary licenses",
            "Set up distribution network with retailers",
            "Invest in transportation and storage facilities"
          ],
          estimatedMonthlyProfit: "500,000 - 2,000,000 RWF"
        }
      },
      Retail: {
        low: {
          title: "Neighborhood Convenience Store",
          description: "Open a small shop selling daily essentials like groceries, airtime, basic household items, and snacks. Focus on serving your immediate community with convenience and competitive prices.",
          startupSteps: [
            "Find a suitable location with good foot traffic",
            "Stock essential items: rice, oil, soap, airtime cards",
            "Build relationships with suppliers for better prices",
            "Offer credit to trusted customers to build loyalty",
            "Track inventory and sales to optimize stock"
          ],
          estimatedMonthlyProfit: "80,000 - 200,000 RWF"
        },
        high: {
          title: "Electronics & Accessories Store",
          description: "Open a modern electronics store selling smartphones, accessories, and gadgets. Include repair services and phone unlocking to maximize revenue streams.",
          startupSteps: [
            "Secure a prime location in a busy commercial area",
            "Stock popular smartphone brands and accessories",
            "Train staff on product knowledge and repair skills",
            "Establish partnerships with suppliers and warranty providers",
            "Implement POS system and inventory management"
          ],
          estimatedMonthlyProfit: "400,000 - 1,200,000 RWF"
        }
      },
      Services: {
        low: {
          title: "Motorcycle Taxi (Moto) Service",
          description: "Start a motorcycle taxi service in your area. With proper licensing and a reliable motorcycle, you can provide transportation services to community members.",
          startupSteps: [
            "Obtain motorcycle driving license and taxi permit",
            "Purchase or lease a reliable motorcycle",
            "Register with local taxi associations",
            "Build a customer base through reliable service",
            "Consider joining ride-hailing apps for more customers"
          ],
          estimatedMonthlyProfit: "100,000 - 250,000 RWF"
        },
        high: {
          title: "Digital Marketing Agency",
          description: "Offer digital marketing services to local businesses including social media management, website development, and online advertising campaigns.",
          startupSteps: [
            "Develop your digital marketing skills and certifications",
            "Create a portfolio of sample work and case studies",
            "Build your own professional website and social media presence",
            "Network with local businesses and offer free consultations",
            "Scale by hiring freelancers and building a team"
          ],
          estimatedMonthlyProfit: "300,000 - 800,000 RWF"
        }
      },
      Farming: {
        low: {
          title: "Vegetable Garden & Market Supply",
          description: "Start a small-scale vegetable garden focusing on high-demand crops like tomatoes, onions, and leafy greens. Supply directly to local markets and restaurants.",
          startupSteps: [
            "Secure land for farming (rent or own)",
            "Choose fast-growing, high-demand vegetables",
            "Set up irrigation system and prepare soil",
            "Plant crops in rotation for continuous harvest",
            "Build relationships with market vendors and restaurants"
          ],
          estimatedMonthlyProfit: "60,000 - 180,000 RWF"
        },
        high: {
          title: "Modern Poultry Farm",
          description: "Establish a modern poultry farm with proper housing, feeding systems, and disease management. Focus on both egg production and meat birds for diverse income streams.",
          startupSteps: [
            "Construct modern poultry houses with proper ventilation",
            "Purchase quality chicks from certified suppliers",
            "Set up feeding and watering systems",
            "Implement biosecurity measures and vaccination programs",
            "Develop marketing channels for eggs and meat"
          ],
          estimatedMonthlyProfit: "400,000 - 1,000,000 RWF"
        }
      },
      Tech: {
        low: {
          title: "Computer Training Center",
          description: "Start a small computer training center teaching basic computer skills, Microsoft Office, and internet usage to community members, especially youth and adults.",
          startupSteps: [
            "Set up a small classroom with 4-6 computers",
            "Develop curriculum for basic computer skills",
            "Market to schools, churches, and community centers",
            "Offer flexible scheduling including evening classes",
            "Add services like typing, printing, and internet cafe"
          ],
          estimatedMonthlyProfit: "120,000 - 300,000 RWF"
        },
        high: {
          title: "Software Development Company",
          description: "Start a software development company creating custom applications for local businesses, government agencies, and international clients through remote work.",
          startupSteps: [
            "Assemble a team of skilled developers and designers",
            "Set up a professional office with reliable internet",
            "Build a portfolio of sample applications and websites",
            "Network with potential clients and attend tech events",
            "Register on international freelancing platforms"
          ],
          estimatedMonthlyProfit: "800,000 - 3,000,000 RWF"
        }
      }
    };

    const categoryIdeas = ideas[type as keyof typeof ideas];
    const budgetCategory = budget < 500000 ? 'low' : 'high';
    
    return categoryIdeas[budgetCategory as keyof typeof categoryIdeas];
  };

  const downloadPDF = () => {
    toast({
      title: "PDF Download",
      description: "PDF download feature coming soon!",
    });
  };

  if (!user) {
    return null;
  }

  // List of all districts in Rwanda
  const rwandaDistricts = [
    "Gasabo", "Kicukiro", "Nyarugenge",
    "Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana",
    "Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo",
    "Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango",
    "Karongi", "Ngororero", "Nyabihu", "Rubavu", "Rutsiro",
    "Rusizi", "Nyamasheke"
  ];

  // Grouped business types for Rwanda
  const businessTypeGroups = [
    {
      label: "Urban Business Types",
      types: [
        "Supermarket", "Pharmacy", "Restaurant", "Hotel", "Bar", "Tech Startup", "Co-working Space", "Delivery Service", "Car Wash", "Printing & Stationery", "Mobile Money Shop", "Fashion Boutique", "Electronics Shop", "Beauty Salon", "Fitness Center", "Education Center", "Health Clinic", "Financial Services (SACCO, Microfinance)", "Construction Company", "Transport Company", "Event Planning", "Real Estate Agency", "ICT Services", "Professional Services (Legal, Accounting)", "Food Processing"
      ]
    },
    {
      label: "Rural Business Types",
      types: [
        "Crop Farming", "Livestock Farming", "Poultry Farming", "Agro-processing", "Village Savings Group", "Local Crafts (Basketry, Pottery)", "Solar Energy Sales", "Water Kiosk", "Tailoring", "Retail Shop", "Kiosk", "Motorcycle Taxi (Moto)", "Brick Making", "Furniture Making", "Milk Collection Center", "Maize Milling", "Rice Milling", "Honey Production", "Fish Farming", "Cooperative Business", "Mobile Money Agent", "Small Restaurant", "Barber Shop", "Bicycle Repair", "Community Pharmacy"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Business Idea Generator</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            <Lightbulb className="h-8 w-8 text-black" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Business Idea Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get AI-powered business ideas tailored to your budget and interests
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8 border-2 border-yellow-400 bg-gradient-to-br from-white to-yellow-50 dark:from-gray-800 dark:to-yellow-900/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-black dark:text-white">
              Tell us about your business goals
            </CardTitle>
            <CardDescription className="text-gray-700 dark:text-gray-300">
              Enter your budget and select your preferred business type
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Enter your budget (RWF)
              </label>
              <Input
                type="number"
                placeholder="e.g., 500000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="border-yellow-400 focus:border-yellow-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Select business type
              </label>
              <Select value={businessType} onValueChange={setBusinessType}>
                <SelectTrigger className="border-yellow-400 focus:border-yellow-500">
                  <SelectValue placeholder="Choose a business category" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypeGroups.map((group) => (
                    <>
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded">
                        {group.label}
                      </div>
                      {group.types.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Select your district
              </label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="border-yellow-400 focus:border-yellow-500">
                  <SelectValue placeholder="Choose your district" />
                </SelectTrigger>
                <SelectContent>
                  {rwandaDistricts.map((district) => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateBusinessIdea}
              disabled={isGenerating}
              className="w-full bg-black hover:bg-gray-800 text-yellow-400 font-semibold py-3 dark:bg-yellow-400 dark:hover:bg-yellow-500 dark:text-black"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Business Idea...
                </>
              ) : (
                "Generate Business Idea"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Business Idea */}
        {businessIdea && (
          <Card className="mb-8 border-2 border-yellow-400 bg-gradient-to-br from-white to-yellow-50 dark:from-gray-800 dark:to-yellow-900/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-black dark:text-white flex items-center">
                <Lightbulb className="h-6 w-6 mr-2 text-yellow-600" />
                {businessIdea.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-black dark:text-white mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300">{businessIdea.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-black dark:text-white mb-2">Startup Steps</h3>
                <ul className="space-y-2">
                  {businessIdea.startupSteps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-black dark:text-white mb-2">Estimated Monthly Profit</h3>
                <div className="bg-black dark:bg-yellow-400 text-yellow-400 dark:text-black px-4 py-2 rounded-lg inline-block font-bold text-lg">
                  {businessIdea.estimatedMonthlyProfit}
                </div>
              </div>

              <Button 
                onClick={downloadPDF}
                variant="outline"
                className="border-yellow-400 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-400 dark:text-yellow-400"
              >
                <Download className="h-4 w-4 mr-2" />
                Download as PDF
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-12 py-6 border-t border-yellow-400">
          <p className="text-gray-600 dark:text-gray-300">
            Powered by <strong className="text-yellow-600">Sales Reminder Pro AI</strong> | Rwanda 🇷🇼
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessIdeaGenerator;
