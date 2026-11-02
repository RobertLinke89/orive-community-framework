import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const facilitators = [
  { email: "elena.vasquez@test.orive.co", full_name: "Elena Vasquez", professional_title: "Breathwork & Meditation Guide", expertise: "Breathwork, Meditation, Stress Management", bio: "Certified breathwork facilitator with 10+ years of experience helping individuals find inner peace through conscious breathing techniques.", location: "Barcelona, Spain", avatar_url: "/facilitators/facilitator-1.jpg", username: "elena-vasquez" },
  { email: "marcus.chen@test.orive.co", full_name: "Marcus Chen", professional_title: "Transformational Life Coach", expertise: "Life Coaching, Personal Growth, Mindset", bio: "ICF certified coach specializing in helping entrepreneurs and creatives unlock their full potential.", location: "Amsterdam, Netherlands", avatar_url: "/facilitators/facilitator-2.jpg", username: "marcus-chen" },
  { email: "sofia.andersson@test.orive.co", full_name: "Sofia Andersson", professional_title: "Yoga & Movement Therapist", expertise: "Yoga, Movement, Somatic Healing", bio: "RYT-500 yoga teacher blending traditional practices with modern somatic approaches for holistic healing.", location: "Stockholm, Sweden", avatar_url: "/facilitators/facilitator-3.jpg", username: "sofia-andersson" },
  { email: "david.oconnor@test.orive.co", full_name: "David O'Connor", professional_title: "Sound Healing Practitioner", expertise: "Sound Healing, Energy Work, Relaxation", bio: "Master sound healer using Tibetan bowls, gongs, and voice to create transformative sonic experiences.", location: "Dublin, Ireland", avatar_url: "/facilitators/facilitator-4.jpg", username: "david-oconnor" },
  { email: "priya.sharma@test.orive.co", full_name: "Priya Sharma", professional_title: "Ayurvedic Wellness Consultant", expertise: "Ayurveda, Nutrition, Holistic Health", bio: "Ayurvedic practitioner helping clients restore balance through personalized lifestyle and dietary guidance.", location: "Berlin, Germany", avatar_url: "/facilitators/facilitator-5.jpg", username: "priya-sharma" },
  { email: "lucas.fernandez@test.orive.co", full_name: "Lucas Fernandez", professional_title: "Ecstatic Dance Facilitator", expertise: "Dance, Movement, Expression", bio: "Creating safe spaces for authentic movement and self-expression through conscious dance experiences.", location: "Lisbon, Portugal", avatar_url: "/facilitators/facilitator-6.jpg", username: "lucas-fernandez" },
  { email: "nina.kowalski@test.orive.co", full_name: "Nina Kowalski", professional_title: "Trauma-Informed Bodyworker", expertise: "Bodywork, Trauma Release, Somatic Therapy", bio: "Certified somatic experiencing practitioner supporting nervous system regulation and trauma healing.", location: "Vienna, Austria", avatar_url: "/facilitators/facilitator-7.jpg", username: "nina-kowalski" },
  { email: "thomas.mueller@test.orive.co", full_name: "Thomas Mueller", professional_title: "Executive Leadership Coach", expertise: "Leadership, Business, Transformation", bio: "Former Fortune 500 executive now guiding leaders through conscious business practices.", location: "Zurich, Switzerland", avatar_url: "/facilitators/facilitator-8.jpg", username: "thomas-mueller" },
  { email: "amara.diallo@test.orive.co", full_name: "Amara Diallo", professional_title: "Spiritual Guide & Ceremonialist", expertise: "Ceremony, Ritual, Spiritual Guidance", bio: "Keeper of sacred traditions, facilitating meaningful ceremonies for life transitions.", location: "Paris, France", avatar_url: "/facilitators/facilitator-9.jpg", username: "amara-diallo" },
  { email: "henrik.larsen@test.orive.co", full_name: "Henrik Larsen", professional_title: "Cold Exposure & Resilience Coach", expertise: "Cold Therapy, Breathwork, Resilience", bio: "Wim Hof Method instructor helping people build mental and physical resilience.", location: "Copenhagen, Denmark", avatar_url: "/facilitators/facilitator-10.jpg", username: "henrik-larsen" },
  { email: "isabella.romano@test.orive.co", full_name: "Isabella Romano", professional_title: "Mindfulness & MBSR Teacher", expertise: "Mindfulness, MBSR, Stress Reduction", bio: "MBSR certified teacher bringing mindfulness practices to individuals and organizations.", location: "Milan, Italy", avatar_url: "/facilitators/facilitator-11.jpg", username: "isabella-romano" },
  { email: "james.wilson@test.orive.co", full_name: "James Wilson", professional_title: "Holistic Nutrition Coach", expertise: "Nutrition, Wellness, Lifestyle", bio: "Functional nutrition practitioner helping clients optimize health through personalized protocols.", location: "London, UK", avatar_url: "/facilitators/facilitator-12.jpg", username: "james-wilson" },
  { email: "yuki.tanaka@test.orive.co", full_name: "Yuki Tanaka", professional_title: "Reiki Master & Energy Healer", expertise: "Reiki, Energy Work, Healing", bio: "Usui Reiki Master offering gentle energy healing for physical and emotional wellbeing.", location: "Munich, Germany", avatar_url: "/facilitators/facilitator-13.jpg", username: "yuki-tanaka" },
  { email: "clara.santos@test.orive.co", full_name: "Clara Santos", professional_title: "Women's Circle Facilitator", expertise: "Women's Circles, Sacred Feminine, Community", bio: "Creating nurturing spaces for women to connect, heal, and reclaim their power together.", location: "Porto, Portugal", avatar_url: "/facilitators/facilitator-14.jpg", username: "clara-santos" },
  { email: "oliver.berg@test.orive.co", full_name: "Oliver Berg", professional_title: "Men's Work & Shadow Coach", expertise: "Men's Work, Shadow Work, Personal Growth", bio: "Guiding men through deep inner work to become more authentic and emotionally available.", location: "Oslo, Norway", avatar_url: "/facilitators/facilitator-15.jpg", username: "oliver-berg" },
];

const sessions = [
  { title: "Transformational Breathwork Session", description: "A powerful 90-minute breathwork journey to release stored emotions and access expanded states of consciousness.", price: "€95", duration: 90, tags: ["Breathwork", "Healing", "Transformation"] },
  { title: "Life Purpose Discovery Coaching", description: "Clarity session to uncover your unique gifts and align with your life's purpose.", price: "€150", duration: 60, tags: ["Coaching", "Purpose", "Clarity"] },
  { title: "Private Vinyasa Flow", description: "Personalized yoga session tailored to your body's needs and goals.", price: "€80", duration: 75, tags: ["Yoga", "Movement", "Flexibility"] },
  { title: "Sound Bath & Healing Session", description: "Deep relaxation through therapeutic sound frequencies using crystal bowls and gongs.", price: "€70", duration: 60, tags: ["Sound Healing", "Relaxation", "Energy"] },
  { title: "Ayurvedic Consultation", description: "Comprehensive assessment of your constitution with personalized lifestyle recommendations.", price: "€120", duration: 90, tags: ["Ayurveda", "Health", "Nutrition"] },
  { title: "Conscious Movement Session", description: "Private session exploring authentic movement and embodied expression.", price: "€85", duration: 60, tags: ["Dance", "Movement", "Expression"] },
  { title: "Somatic Trauma Release", description: "Gentle bodywork session to release held tension and regulate the nervous system.", price: "€140", duration: 90, tags: ["Somatic", "Trauma", "Healing"] },
  { title: "Executive Presence Coaching", description: "Leadership coaching to enhance your impact and authentic presence.", price: "€250", duration: 60, tags: ["Leadership", "Business", "Coaching"] },
  { title: "Sacred Blessing Ceremony", description: "Personal ceremony to honor life transitions and set powerful intentions.", price: "€180", duration: 120, tags: ["Ceremony", "Ritual", "Blessing"] },
  { title: "Ice Bath & Breathwork", description: "Guided cold exposure session with breathwork preparation and integration.", price: "€90", duration: 75, tags: ["Cold Therapy", "Breathwork", "Resilience"] },
  { title: "Mindfulness Coaching", description: "Learn practical mindfulness techniques for daily stress management.", price: "€100", duration: 60, tags: ["Mindfulness", "Meditation", "Stress"] },
  { title: "Nutrition Reset Session", description: "Personalized nutrition plan based on your health goals and lifestyle.", price: "€130", duration: 75, tags: ["Nutrition", "Health", "Wellness"] },
  { title: "Reiki Energy Healing", description: "Gentle hands-on healing session to restore energy flow and balance.", price: "€75", duration: 60, tags: ["Reiki", "Energy", "Healing"] },
  { title: "Sacred Feminine Coaching", description: "Supportive session for women reclaiming their authentic power.", price: "€110", duration: 75, tags: ["Feminine", "Empowerment", "Healing"] },
  { title: "Shadow Work Integration", description: "Deep dive into unconscious patterns with compassionate guidance.", price: "€145", duration: 90, tags: ["Shadow Work", "Growth", "Integration"] },
];

const groupSessions = [
  { title: "Weekly Breathwork Circle", description: "Community breathwork practice every Wednesday evening. Open to all levels.", price: "€25", duration: 90, capacity: 20, tags: ["Breathwork", "Community", "Weekly"] },
  { title: "Men's Circle", description: "Monthly gathering for men to connect, share, and grow together.", price: "€35", duration: 120, capacity: 15, tags: ["Men's Work", "Community", "Connection"] },
  { title: "Morning Yoga Flow", description: "Start your day with energizing vinyasa flow. Drop-in friendly.", price: "€18", duration: 75, capacity: 25, tags: ["Yoga", "Morning", "Energy"] },
  { title: "Gong Bath Meditation", description: "Monthly deep relaxation through powerful gong vibrations.", price: "€30", duration: 90, capacity: 30, tags: ["Sound Healing", "Meditation", "Relaxation"] },
  { title: "Ayurvedic Cooking Class", description: "Learn to prepare healing meals based on Ayurvedic principles.", price: "€55", duration: 180, capacity: 12, tags: ["Ayurveda", "Cooking", "Nutrition"] },
  { title: "Ecstatic Dance Journey", description: "Friday night conscious dance experience with live DJ.", price: "€22", duration: 150, capacity: 80, tags: ["Dance", "Ecstatic", "Expression"] },
  { title: "Trauma-Sensitive Yoga", description: "Gentle, grounding yoga designed for nervous system regulation.", price: "€20", duration: 75, capacity: 15, tags: ["Yoga", "Trauma", "Healing"] },
  { title: "Leadership Mastermind", description: "Monthly peer coaching circle for conscious leaders.", price: "€75", duration: 150, capacity: 10, tags: ["Leadership", "Mastermind", "Business"] },
  { title: "New Moon Ceremony", description: "Monthly gathering to set intentions under the new moon.", price: "€40", duration: 120, capacity: 20, tags: ["Ceremony", "Moon", "Intention"] },
  { title: "Wim Hof Workshop", description: "Learn the fundamentals of the Wim Hof Method in a group setting.", price: "€65", duration: 180, capacity: 20, tags: ["Wim Hof", "Cold", "Breathwork"] },
  { title: "Mindful Movement Class", description: "Meditative movement practice combining yoga and qigong.", price: "€15", duration: 60, capacity: 25, tags: ["Mindfulness", "Movement", "Meditation"] },
  { title: "Nutrition Workshop", description: "Interactive workshop on gut health and anti-inflammatory eating.", price: "€45", duration: 120, capacity: 18, tags: ["Nutrition", "Workshop", "Health"] },
  { title: "Reiki Share Circle", description: "Exchange healing energy with fellow practitioners. All levels welcome.", price: "€15", duration: 90, capacity: 12, tags: ["Reiki", "Community", "Practice"] },
  { title: "Women's Circle", description: "Sacred gathering for women to share, heal, and celebrate.", price: "€35", duration: 150, capacity: 20, tags: ["Women's Circle", "Sisterhood", "Healing"] },
  { title: "Shadow Work Group", description: "Facilitated group exploration of unconscious patterns.", price: "€50", duration: 180, capacity: 12, tags: ["Shadow Work", "Group", "Depth"] },
];

const events = [
  { title: "5-Day Breathwork Intensive", description: "Immersive training in conscious connected breathing. Transform your practice and life.", price: "€750", duration: 2400, capacity: 25, startDays: 30, tags: ["Breathwork", "Intensive", "Training"] },
  { title: "Weekend Life Purpose Retreat", description: "2-day retreat to clarify your vision and align with your deepest calling.", price: "€495", duration: 960, capacity: 16, startDays: 45, tags: ["Retreat", "Purpose", "Transformation"] },
  { title: "Yoga & Meditation Retreat", description: "7-day silent retreat in the mountains combining yoga, meditation, and nature.", price: "€1200", duration: 5040, capacity: 20, startDays: 60, tags: ["Retreat", "Yoga", "Silent"] },
  { title: "Sound Healing Festival", description: "Full day of immersive sound experiences with multiple practitioners.", price: "€85", duration: 480, capacity: 100, startDays: 21, tags: ["Festival", "Sound", "Healing"] },
  { title: "Ayurveda Panchakarma Week", description: "Traditional cleansing program with personalized treatments and guidance.", price: "€2500", duration: 5040, capacity: 8, startDays: 90, tags: ["Ayurveda", "Cleanse", "Retreat"] },
  { title: "Dance Your Soul Weekend", description: "2-day journey through conscious dance, movement, and expression.", price: "€245", duration: 960, capacity: 40, startDays: 35, tags: ["Dance", "Weekend", "Soul"] },
  { title: "Somatic Experiencing Training", description: "3-day introductory training in trauma-informed bodywork.", price: "€650", duration: 1440, capacity: 18, startDays: 75, tags: ["Training", "Somatic", "Professional"] },
  { title: "Conscious Leadership Summit", description: "Annual gathering of purpose-driven leaders and changemakers.", price: "€395", duration: 960, capacity: 150, startDays: 120, tags: ["Summit", "Leadership", "Conference"] },
  { title: "Vision Quest Experience", description: "Traditional 4-day wilderness quest for deep self-discovery.", price: "€595", duration: 5760, capacity: 12, startDays: 55, tags: ["Vision Quest", "Ceremony", "Nature"] },
  { title: "Arctic Resilience Expedition", description: "5-day journey combining cold exposure, breathwork, and nature immersion.", price: "€1850", duration: 7200, capacity: 14, startDays: 85, tags: ["Expedition", "Cold", "Adventure"] },
  { title: "MBSR 8-Week Program", description: "Complete Mindfulness-Based Stress Reduction certification program.", price: "€450", duration: 1440, capacity: 20, startDays: 14, tags: ["MBSR", "Program", "Certification"] },
  { title: "Holistic Health Summit", description: "Weekend conference on integrative approaches to wellness.", price: "€195", duration: 960, capacity: 200, startDays: 50, tags: ["Summit", "Health", "Conference"] },
  { title: "Reiki Master Training", description: "Advanced certification retreat for aspiring Reiki masters.", price: "€895", duration: 2880, capacity: 10, startDays: 65, tags: ["Reiki", "Training", "Certification"] },
  { title: "Divine Feminine Retreat", description: "5-day immersive journey into sacred feminine practices and wisdom.", price: "€895", duration: 3600, capacity: 24, startDays: 40, tags: ["Retreat", "Feminine", "Sacred"] },
  { title: "Men's Initiation Weekend", description: "Transformative rite of passage experience for modern men.", price: "€395", duration: 1440, capacity: 16, startDays: 28, tags: ["Initiation", "Men", "Transformation"] },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const createdUsers: { id: string; email: string; full_name: string }[] = [];

    // Create auth users and profiles
    for (const facilitator of facilitators) {
      console.log(`Creating user: ${facilitator.email}`);
      
      // Check if user exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === facilitator.email);
      
      let userId: string;
      
      if (existingUser) {
        userId = existingUser.id;
        console.log(`User already exists: ${userId}`);
      } else {
        // Create new auth user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: facilitator.email,
          password: "TestPassword123!",
          email_confirm: true,
        });
        
        if (createError) {
          console.error(`Error creating user ${facilitator.email}:`, createError);
          continue;
        }
        
        userId = newUser.user.id;
        console.log(`Created user: ${userId}`);
      }

      // Upsert profile
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({
          id: userId,
          full_name: facilitator.full_name,
          professional_title: facilitator.professional_title,
          expertise: facilitator.expertise,
          bio: facilitator.bio,
          location: facilitator.location,
          avatar_url: facilitator.avatar_url,
          username: facilitator.username,
          onboarding_completed: true,
          is_visible: true,
        }, { onConflict: "id" });

      if (profileError) {
        console.error(`Error creating profile for ${facilitator.email}:`, profileError);
        continue;
      }

      createdUsers.push({ id: userId, email: facilitator.email, full_name: facilitator.full_name });
    }

    // Create offerings for each facilitator type
    const allOfferings: any[] = [];
    
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const session = sessions[i % sessions.length];
      const group = groupSessions[i % groupSessions.length];
      const event = events[i % events.length];

      // 1:1 Session (individual)
      allOfferings.push({
        facilitator_id: user.id,
        title: session.title,
        description: session.description,
        type: "individual",
        price: session.price,
        duration: session.duration,
        tags: session.tags,
        is_online: Math.random() > 0.3,
        status: "active",
      });

      // Group Session
      allOfferings.push({
        facilitator_id: user.id,
        title: group.title,
        description: group.description,
        type: "group",
        price: group.price,
        duration: group.duration,
        capacity: group.capacity,
        tags: group.tags,
        is_online: Math.random() > 0.5,
        status: "active",
      });

      // Event
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + event.startDays);
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + event.duration);

      allOfferings.push({
        facilitator_id: user.id,
        title: event.title,
        description: event.description,
        type: "event",
        price: event.price,
        duration: event.duration,
        capacity: event.capacity,
        tags: event.tags,
        is_online: false,
        status: "active",
        start_at: startDate.toISOString(),
        end_at: endDate.toISOString(),
      });
    }

    // Insert all offerings
    const { data: insertedOfferings, error: offeringsError } = await supabaseAdmin
      .from("offerings")
      .insert(allOfferings)
      .select("id, title, type");

    if (offeringsError) {
      console.error("Error inserting offerings:", offeringsError);
      throw offeringsError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        created: {
          facilitators: createdUsers.length,
          offerings: insertedOfferings?.length ?? 0,
        },
        facilitators: createdUsers,
        offerings: insertedOfferings,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error seeding data:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
