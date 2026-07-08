export interface FoodAnalysis {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  confidence: number;
  items: { name: string; calories: number }[];
  notes: string;
}

const DEMO_FOODS: FoodAnalysis[] = [
  {
    name: "Grilled Chicken Salad",
    calories: 420,
    protein: 38,
    carbs: 18,
    fat: 22,
    servingSize: "1 large bowl (~350g)",
    confidence: 0.85,
    items: [
      { name: "Grilled chicken breast", calories: 220 },
      { name: "Mixed greens", calories: 30 },
      { name: "Cherry tomatoes", calories: 25 },
      { name: "Olive oil dressing", calories: 145 },
    ],
    notes: "Balanced meal with lean protein and healthy fats.",
  },
  {
    name: "Avocado Toast with Eggs",
    calories: 485,
    protein: 22,
    carbs: 42,
    fat: 28,
    servingSize: "2 slices with toppings",
    confidence: 0.82,
    items: [
      { name: "Whole grain bread", calories: 160 },
      { name: "Avocado", calories: 120 },
      { name: "Fried eggs (2)", calories: 180 },
      { name: "Seasoning", calories: 25 },
    ],
    notes: "Good source of healthy fats and fiber.",
  },
  {
    name: "Salmon with Rice & Vegetables",
    calories: 620,
    protein: 42,
    carbs: 55,
    fat: 24,
    servingSize: "1 plate (~400g)",
    confidence: 0.88,
    items: [
      { name: "Grilled salmon fillet", calories: 350 },
      { name: "Steamed rice", calories: 180 },
      { name: "Broccoli & carrots", calories: 50 },
      { name: "Lemon butter", calories: 40 },
    ],
    notes: "Excellent omega-3 source with complex carbs.",
  },
  {
    name: "Pasta with Marinara Sauce",
    calories: 540,
    protein: 16,
    carbs: 78,
    fat: 18,
    servingSize: "1.5 cups",
    confidence: 0.8,
    items: [
      { name: "Penne pasta", calories: 380 },
      { name: "Marinara sauce", calories: 90 },
      { name: "Parmesan cheese", calories: 70 },
    ],
    notes: "Carb-heavy meal — consider adding protein.",
  },
  {
    name: "Berry Protein Smoothie Bowl",
    calories: 380,
    protein: 28,
    carbs: 48,
    fat: 10,
    servingSize: "1 bowl",
    confidence: 0.83,
    items: [
      { name: "Mixed berries", calories: 80 },
      { name: "Protein powder", calories: 120 },
      { name: "Banana", calories: 90 },
      { name: "Granola topping", calories: 90 },
    ],
    notes: "Great post-workout option with antioxidants.",
  },
];

function pickDemoFood(): FoodAnalysis {
  const index = Math.floor(Math.random() * DEMO_FOODS.length);
  return { ...DEMO_FOODS[index] };
}

export async function analyzeFoodImage(
  imageBase64: string
): Promise<FoodAnalysis & { source: "ai" | "demo" }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 1500));
    return { ...pickDemoFood(), source: "demo" };
  }

  try {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a nutrition expert. Analyze food images and estimate nutritional content.
Return ONLY valid JSON with this exact structure:
{
  "name": "descriptive meal name",
  "calories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "servingSize": "description",
  "confidence": number (0-1),
  "items": [{"name": "item", "calories": number}],
  "notes": "brief nutrition note"
}`,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: imageBase64.startsWith("data:")
                  ? imageBase64
                  : `data:image/jpeg;base64,${imageBase64}`,
              },
            },
            {
              type: "text",
              text: "Analyze this food image. Estimate calories and macronutrients for the visible portion.",
            },
          ],
        },
      ],
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response");

    const parsed = JSON.parse(content) as FoodAnalysis;
    return { ...parsed, source: "ai" };
  } catch {
    return { ...pickDemoFood(), source: "demo" };
  }
}

export interface Recommendation {
  id: string;
  type: "success" | "warning" | "tip" | "goal";
  title: string;
  description: string;
  priority: number;
}

export function generateRecommendations(data: {
  avgCalories: number;
  calorieGoal: number;
  avgProtein: number;
  proteinGoal: number;
  avgCarbs: number;
  carbsGoal: number;
  avgFat: number;
  fatGoal: number;
  daysLogged: number;
  weightChange: number | null;
  targetWeight: number | null;
  mealTypeDistribution: Record<string, number>;
}): Recommendation[] {
  const recs: Recommendation[] = [];
  const {
    avgCalories,
    calorieGoal,
    avgProtein,
    proteinGoal,
    avgCarbs,
    carbsGoal,
    daysLogged,
    weightChange,
    targetWeight,
    mealTypeDistribution,
  } = data;

  if (daysLogged < 3) {
    recs.push({
      id: "log-more",
      type: "tip",
      title: "Build your tracking habit",
      description:
        "Log meals for at least 3 days to unlock personalized insights. Consistency is the key to reaching your goals.",
      priority: 1,
    });
  }

  const calorieDiff = avgCalories - calorieGoal;
  if (calorieDiff > 200) {
    recs.push({
      id: "calories-high",
      type: "warning",
      title: "Calories above target",
      description: `You're averaging ${Math.round(avgCalories)} cal/day, about ${Math.round(calorieDiff)} above your ${calorieGoal} goal. Try smaller portions or swap high-calorie snacks.`,
      priority: 2,
    });
  } else if (calorieDiff < -300 && daysLogged >= 3) {
    recs.push({
      id: "calories-low",
      type: "warning",
      title: "Eating below your goal",
      description: `You're averaging ${Math.round(avgCalories)} cal/day. Undereating can slow metabolism — add nutrient-dense snacks like nuts or Greek yogurt.`,
      priority: 2,
    });
  } else if (daysLogged >= 3) {
    recs.push({
      id: "calories-good",
      type: "success",
      title: "Great calorie balance",
      description: `You're hitting your calorie target with an average of ${Math.round(avgCalories)} cal/day. Keep it up!`,
      priority: 3,
    });
  }

  const proteinRatio = avgProtein / proteinGoal;
  if (proteinRatio < 0.8 && daysLogged >= 3) {
    recs.push({
      id: "protein-low",
      type: "tip",
      title: "Boost your protein intake",
      description: `You're averaging ${Math.round(avgProtein)}g protein vs your ${proteinGoal}g goal. Add eggs, chicken, fish, or legumes to meals.`,
      priority: 2,
    });
  } else if (proteinRatio >= 0.95 && daysLogged >= 3) {
    recs.push({
      id: "protein-good",
      type: "success",
      title: "Protein goals on track",
      description: `Excellent protein intake at ${Math.round(avgProtein)}g/day. This supports muscle maintenance and satiety.`,
      priority: 4,
    });
  }

  if (avgCarbs > carbsGoal * 1.2 && daysLogged >= 3) {
    recs.push({
      id: "carbs-high",
      type: "tip",
      title: "Carbs running high",
      description: `Carb intake is ${Math.round(avgCarbs)}g vs ${carbsGoal}g goal. Consider swapping refined carbs for vegetables or whole grains.`,
      priority: 3,
    });
  }

  const snackCount = mealTypeDistribution["snack"] || 0;
  const totalMeals = Object.values(mealTypeDistribution).reduce((a, b) => a + b, 0);
  if (totalMeals > 0 && snackCount / totalMeals > 0.4) {
    recs.push({
      id: "snack-heavy",
      type: "tip",
      title: "Lots of snacking detected",
      description: "Over 40% of your logs are snacks. Try planning fuller meals to reduce mindless grazing.",
      priority: 3,
    });
  }

  if (weightChange !== null && targetWeight !== null) {
    if (weightChange < 0 && weightChange > targetWeight) {
      recs.push({
        id: "weight-progress",
        type: "success",
        title: "Weight trending down",
        description: `You've lost ${Math.abs(weightChange).toFixed(1)} lbs this week. Stay consistent with your current approach.`,
        priority: 2,
      });
    } else if (weightChange > 0.5) {
      recs.push({
        id: "weight-up",
        type: "warning",
        title: "Weight increased this week",
        description: `Up ${weightChange.toFixed(1)} lbs. Review portion sizes and check for hidden liquid calories.`,
        priority: 2,
      });
    }
  }

  if (recs.length === 0) {
    recs.push({
      id: "start",
      type: "tip",
      title: "Welcome to NutriAI",
      description:
        "Start logging your meals to get personalized nutrition recommendations powered by AI.",
      priority: 1,
    });
  }

  return recs.sort((a, b) => a.priority - b.priority);
}
