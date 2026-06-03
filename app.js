// ============================================================
// STRENGTH FOUNDATION PROGRAM — APP LOGIC
// ============================================================

// HTML escape for safely rendering user-typed strings inside templates
function esc(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

const PROGRAM_START = new Date(2026, 4, 19); // May 19, 2026 (Tue) — Wk 1 Day A
const PROGRAM_END   = new Date(2026, 6, 11); // Jul 11, 2026 (Sat) — Wk 8 Day C

// ============================================================
// EXERCISE DATA — DEFAULT PROGRAM (seed; user can override in app)
// reps array indexed by phase block: [Wk1-2, Wk3-4, Wk5-6, Wk7-8]
// ============================================================
const DEFAULT_DAYS = {
  A: {
    title: 'Day A',
    sub: 'Lower Body + Core',
    weekday: 2, // Tuesday
    weekdayShort: 'Tue',
    weekdayLong: 'Tuesday',
    duration: '~35 min',
    equipment: 'KB 32lb · Bench · Band · ANCORE · Stepper · Mat · Vest (Wk 5+)',
    injection: false,
    sections: [
      { title: 'WARM-UP', duration: '5 min', exercises: [
        { id: 'A-w1', name: 'Stair Stepper', equip: 'Mini Stair Stepper',
          reps: ['5 min · Easy pace','5 min · Moderate','5 min · Moderate-fast','5 min · Fast pace'],
          cue: 'Just get warm — not a workout yet. Light effort.', noLog: true },
      ]},
      { title: 'MOBILITY PREP', duration: '3 min', exercises: [
        { id: 'A-mp1', name: 'World\'s Greatest Stretch', equip: 'Mat',
          reps: ['2×5 ea','2×6 ea','3×6 ea','3×8 ea'],
          cue: 'Step into a deep lunge, back knee hovering. Drop the same-side hand to the floor inside the front foot. Reach the other arm up and rotate the chest open toward the ceiling. Lower hand, switch reach, then step back to push-up position and switch sides. Hits hip flexors, hamstrings, T-spine in one shot — primes everything below.', noLog: true },
        { id: 'A-mp2', name: '90/90 Hip Roll', equip: 'Mat',
          reps: ['2×6 ea','2×8 ea','3×8 ea','3×10 ea'],
          cue: 'Seated, one leg in front at 90°, other to the side at 90°. Sit tall — hands off the floor. Drive the back knee down to the floor and rotate the hips to switch sides. Slow and controlled. Wakes up hip internal and external rotation before squatting.', noLog: true },
      ]},
      { title: 'LOWER BODY', exercises: [
        { id: 'A-l1', name: 'Goblet Squat', equip: 'KB 32lb',
          reps: ['2×8','3×8','3×10 + light vest','3×12 + vest'],
          cue: 'Hold KB at chest. Feet shoulder-width. Sit back and down. Chest tall — don\'t round forward.' },
        { id: 'A-l2', name: 'KB Romanian Deadlift', equip: 'KB 32lb',
          reps: ['2×8','3×10','3×10 + light vest','3×12 + vest'],
          cue: 'Hinge at hips, soft knee bend. KB tracks down your shins. Feel the hamstring stretch. Drive hips forward to stand.' },
        { id: 'A-l8', name: 'Bulgarian Split Squat', equip: 'KB 32lb + bench',
          reps: ['2×8 ea bodyweight','3×8 ea @ KB 32lb','3×10 ea + light vest','3×12 ea + vest'],
          cue: 'Rear foot elevated on a bench/chair behind you. Front foot far enough forward that your knee tracks over toes — not past. KB held goblet at chest (or one in each hand). Lower straight down — back knee toward floor, not back. Drive through the front heel. ~80% of load lives on the front leg. Boyle gospel.' },
        { id: 'A-l5', name: 'Banded Glute Bridge', equip: 'Resistance Band',
          reps: ['2×12','3×15','3×15 + 3 sec hold','3×20 + 3 sec hold'],
          cue: 'Band above knees. Drive through heels. Squeeze glutes at top. Lower slowly — 3 count down.' },
        { id: 'A-l10', name: 'Lateral Lunge', equip: 'KB 32lb',
          reps: ['2×6 ea bodyweight','3×8 ea bodyweight','3×8 ea @ KB 32lb','3×10 ea @ KB + light vest'],
          cue: 'Hold KB at chest (goblet). Stand tall, feet together. Step wide to one side and sit back into that hip — load the working leg, keep the opposite leg straight with toes pointing forward. Chest tall, weight in mid-foot/heel of working leg. Drive through the working heel to return to center. Trains the frontal plane and adductors that bands and machines miss. Boyle-style functional glute med work.' },
      ]},
      { title: 'CORE', exercises: [
        { id: 'A-c1', name: 'Plank Hold', equip: 'Bodyweight',
          reps: ['2×20 sec','3×25 sec','3×30 sec','3×40 sec'],
          cue: 'Forearms or hands. Straight line head to heel. Breathe — don\'t hold your breath. Quality over time.' },
        { id: 'A-c2', name: 'Dead Bug', equip: 'Bodyweight',
          reps: ['2×6 ea','2×8 ea','3×8 ea','3×10 ea'],
          cue: 'Low back pressed to floor the entire time. Opposite arm + leg extends slowly. Control the movement.' },
        { id: 'A-c3', name: 'Straight Leg Sit-Up', equip: 'TRX Slam Ball',
          reps: ['2×8','2×10','3×10','3×12'],
          cue: 'Legs flat on floor — no knee bend. Hold ball at chest or extended overhead. Sit all the way up to vertical. Lower with control. Lead with your abs, don\'t yank with arms or kick your legs.' },
      ]},
      { title: 'COOL-DOWN', duration: '3 min', exercises: [
        { id: 'A-d1', name: 'Hip Flexor Stretch', equip: 'Bodyweight',
          reps: ['30 sec ea','30 sec ea','45 sec ea','45 sec ea'],
          cue: 'Kneeling lunge position. Tuck pelvis under. Feel the front of the back hip.', noLog: true },
        { id: 'A-d2', name: 'Hamstring Stretch', equip: 'TRX or floor',
          reps: ['30 sec ea','30 sec ea','45 sec ea','45 sec ea'],
          cue: 'Seated or standing — reach toward toes. Hold, breathe, relax deeper.', noLog: true },
      ]},
    ],
  },

  B: {
    title: 'Day B',
    sub: 'Upper Body + Core',
    weekday: 4, // Thursday
    weekdayShort: 'Thu',
    weekdayLong: 'Thursday',
    duration: '~33 min',
    equipment: 'TRX · ANCORE (single handle, tricep rope, straight bar) · Jump Rope · Mat / Wall',
    injection: true,
    notes: 'Stay extra hydrated today.',
    sections: [
      { title: 'WARM-UP', duration: '3 min', exercises: [
        { id: 'B-w1', name: 'Ropeless Jump Rope', equip: 'Ropeless Jump Rope',
          reps: ['3 min · Easy','3 min · Moderate','3 min · Moderate','3 min · Fast intervals'],
          cue: 'Light wrist motion. Get blood moving — not cardio. Stop if dizzy or HR spikes.', noLog: true },
      ]},
      { title: 'MOBILITY PREP', duration: '3 min', exercises: [
        { id: 'B-mp1', name: 'Wall Slides', equip: 'Wall',
          reps: ['2×8','2×10','3×10','3×12'],
          cue: 'Back, head, and arms against wall. Slide arms overhead keeping wrists and elbows in contact with the wall. If wrists come off, that\'s your end range — don\'t force it. Trains scap upward rotation and overhead position before any pulling or pressing.', noLog: true },
        { id: 'B-mp2', name: 'Open Book', equip: 'Mat',
          reps: ['2×6 ea','2×8 ea','3×8 ea','3×10 ea'],
          cue: 'Side-lying, knees stacked and bent 90° (top knee anchored), arms extended in front. Rotate the top arm open across your body, eyes follow the hand. Keep the knees pinned together — rotation comes from the spine, not the hips. Critical T-spine prep for rowing and pressing.', noLog: true },
      ]},
      { title: 'UPPER BODY — PULL', exercises: [
        { id: 'B-p1', name: 'TRX Row', equip: 'TRX',
          reps: ['2×8','3×10','3×12','3×15 + vest option'],
          cue: 'Walk feet forward = harder. Body straight. Pull elbows to ribs. Squeeze shoulder blades at top.' },
        { id: 'B-p2', name: 'ANCORE Row', equip: 'ANCORE + single handle',
          reps: ['2×10 @ 15–20 lbs','3×12 @ 25–30 lbs','3×12 @ 35–40 lbs','3×15 @ 45–50 lbs'],
          cue: 'Mount ANCORE at mid-rack height. Single handle. Hinge slightly at hips, brace core. Pull handle to belly button — elbow drives back, squeeze the shoulder blade. Control the return — 3 count out. Track actual load in your set log.' },
        { id: 'B-p3', name: 'Face Pull', equip: 'ANCORE + tricep rope',
          reps: ['2×12 @ 10–15 lbs','3×15 @ 15–20 lbs','3×15 @ 20–25 lbs','3×20 @ 25–30 lbs'],
          cue: 'Tricep rope on ANCORE, mounted at upper-chest / face height. Grip both ends of the rope. Pull rope toward your face, separating your hands as you pull — finish with elbows high, hands by your ears, palms facing forward (external rotation). Lighter load, high reps. This one bulletproofs your shoulders against all the pressing work.' },
        { id: 'B-p4', name: 'Straight Arm Pull-Down', equip: 'ANCORE + straight bar',
          reps: ['2×10 @ 10–15 lbs','3×12 @ 15–20 lbs','3×12 @ 20–25 lbs','3×15 @ 25–30 lbs'],
          cue: 'Straight bar on ANCORE, mounted high. Stand back from the rack, hinge slightly at the hips, arms straight overhead gripping the bar. Keep a SOFT bend at the elbow but lock it — no bicep curl. Drive the bar down in a wide arc to your thighs using only your lats and teres major. Squeeze hard at the bottom. Core braced throughout — this trains anti-extension too. Slow controlled return overhead.' },
      ]},
      { title: 'UPPER BODY — PUSH', exercises: [
        { id: 'B-u1', name: 'TRX Push-Up', equip: 'TRX',
          reps: ['2×6','2×8','3×8','3×10'],
          cue: 'Hands in TRX handles, feet on floor. More upright = easier. Lower slowly, push strong. Progress angle over time.' },
      ]},
      { title: 'CORE', exercises: [
        { id: 'B-c1', name: 'Bird Dog', equip: 'Bodyweight',
          reps: ['2×6 ea','2×8 ea','3×8 ea','3×10 ea'],
          cue: 'On hands and knees. Extend opposite arm + leg. Hold 2 sec. Don\'t let hips rotate. Slow wins.' },
        { id: 'B-c2', name: 'TRX Plank', equip: 'TRX',
          reps: ['2×20 sec','2×25 sec','3×30 sec','3×40 sec'],
          cue: 'Feet in TRX straps, hands on floor. Same as floor plank but more core demand. Breathe.' },
      ]},
      { title: 'COOL-DOWN', duration: '3 min', exercises: [
        { id: 'B-d1', name: 'Chest/Shoulder Stretch', equip: 'Doorway or bands',
          reps: ['30 sec ea','30 sec ea','45 sec ea','45 sec ea'],
          cue: 'Arms at 90° in doorway, lean gently forward. Feel chest open. Breathe.', noLog: true },
        { id: 'B-d2', name: 'Lat Stretch', equip: 'TRX or anchor',
          reps: ['30 sec ea','30 sec ea','45 sec ea','45 sec ea'],
          cue: 'Hold TRX/anchor, sit back, let upper back open. Feels amazing.', noLog: true },
      ]},
    ],
  },

  C: {
    title: 'Day C',
    sub: 'Full Body + KB Power',
    weekday: 6, // Saturday
    weekdayShort: 'Sat',
    weekdayLong: 'Saturday',
    duration: '~38 min',
    equipment: 'KB 32lb · ANCORE · Stepper · Jump Rope · Slam Ball · Mat · Vest (Wk 5+)',
    injection: false,
    notes: 'Day after injection.',
    sections: [
      { title: 'WARM-UP', duration: '5 min', exercises: [
        { id: 'C-w1', name: 'Stair Stepper or Jump Rope', equip: 'Stepper / Rope',
          reps: ['5 min · Easy','5 min · Moderate','5 min · Moderate','5 min · Push pace'],
          cue: 'Your choice — whatever feels better that day. Goal is warm, not tired.', noLog: true },
      ]},
      { title: 'MOBILITY PREP', duration: '3 min', exercises: [
        { id: 'C-mp1', name: 'World\'s Greatest Stretch w/ T-Spine Reach', equip: 'Mat',
          reps: ['2×5 ea','2×6 ea','3×6 ea','3×8 ea'],
          cue: 'Deep lunge, back knee hovering. Same-side hand inside the front foot. Reach the OTHER arm to the ceiling and rotate the chest open — eyes follow the hand. Lower, switch reach, step back, switch sides. Prime mover for hinge patterns — opens the hip flexors and unlocks T-spine before swings and RDLs.', noLog: true },
        { id: 'C-mp2', name: 'Hip Airplane', equip: 'Bodyweight (wall optional)',
          reps: ['2×5 ea','2×6 ea','3×6 ea','3×8 ea'],
          cue: 'Stand on one leg, soft knee bend. Hinge forward into a single-leg RDL position — body in a T shape. From there, slowly rotate the pelvis open (free leg drifts toward the wall behind you) then closed. That\'s one rep. Touch the wall for balance if needed. This is your single-leg RDL insurance policy — trains hip control and rotation under tension.', noLog: true },
      ]},
      { title: 'POWER + LOWER', exercises: [
        { id: 'C-p1', name: 'KB Swing', equip: 'KB 32lb',
          reps: ['2×8','3×10','3×12 + light vest','3×15 + vest'],
          cue: 'Hinge — NOT a squat. Drive hips forward explosively. KB floats to shoulder height. Control the drop.' },
        { id: 'C-p2', name: 'Med Ball Slam', equip: 'TRX Slam Ball',
          reps: ['2×8','3×10','3×12','3×15'],
          cue: 'Ball overhead, full extension on tiptoes. Engage lats and abs and slam HARD to the floor in front of you. No bounce — pick it up, reset, repeat. Explosive down, controlled up. Breathe out on the slam.' },
        { id: 'C-p3', name: 'KB Sumo Deadlift', equip: 'KB 32lb',
          reps: ['2×8','3×10','3×10 + vest','3×12 + vest'],
          cue: 'Wide stance, toes out. KB between feet. Hinge and grip. Drive floor away. Hips and chest rise together.' },
        { id: 'A-l9', name: 'Single Leg KB RDL', equip: 'KB 32lb',
          reps: ['2×8 ea @ KB 32lb','3×8 ea','3×10 ea + light vest','3×12 ea + vest'],
          cue: 'KB in the OPPOSITE hand from the working leg (better counterbalance). Soft bend in the working knee — don\'t lock it. Hinge at the hip, free leg extends straight back, body forms a T shape parallel to floor. KB tracks down close to the working leg. Squeeze the working glute to return. Balance is the point — go slow, set the foot down between reps if needed.' },
      ]},
      { title: 'UPPER + PULL', exercises: [
        { id: 'C-u2', name: 'ANCORE Pull-Down', equip: 'ANCORE + straight bar',
          reps: ['2×10 @ 15–20 lbs','3×12 @ 25–30 lbs','3×12 @ 35–45 lbs','3×15 @ 45–55 lbs'],
          cue: 'Mount ANCORE high on the rack with the straight bar attachment (wider grip = more lats, less biceps). Kneel facing the unit. Pull the bar down to your upper chest — elbows drive down and out, lat focus. Slow release. Don\'t shrug at the top of the return.' },
      ]},
      { title: 'CORE', exercises: [
        { id: 'C-c6', name: 'Half-Kneeling ANCORE Chop', equip: 'ANCORE + single handle',
          reps: ['2×8 ea @ 15–20 lbs','3×10 ea @ 20–25 lbs','3×10 ea @ 25–30 lbs','3×12 ea @ 30–35 lbs'],
          cue: 'Mount ANCORE high on the rack. Kneel perpendicular to the unit — outside knee down, inside knee up (90°). Grab handle with both hands at the high shoulder. Pull the handle DOWN and ACROSS the body to the outside hip in a chopping arc — arms stay relatively straight, the rotation drives from the obliques, not the arms. Core braced hard the whole time — the cable wants to pull you back toward the rack. Slow controlled return. This is anti-rotation expressed as rotation — Cressey signature. Counts are per side.' },
        { id: 'C-c4', name: 'Pallof Press', equip: 'ANCORE + single handle',
          reps: ['2×10 ea @ 15–20 lbs','3×12 ea @ 20–25 lbs','3×12 ea @ 25–30 lbs','3×15 ea @ 30–35 lbs'],
          cue: 'Mount ANCORE at chest height. Stand perpendicular to the rack with the handle pressed into your chest with both hands. Brace core hard. Press the handle straight out in front of you — the cable will try to rotate you toward the rack. RESIST. Hold 2–3 sec at full extension. Slow return. Anti-rotation core — Cressey signature. Counts are per side.' },
        { id: 'C-c3', name: 'Side Plank', equip: 'Bodyweight',
          reps: ['2×15 sec ea','2×20 sec ea','3×25 sec ea','3×30 sec ea'],
          cue: 'Forearm on ground. Body straight. Don\'t let hips sag. Breathe. Progress time each week.' },
        { id: 'C-c5', name: 'Suitcase Carry', equip: 'KB 32lb',
          reps: ['2×20 sec ea side','2×30 sec ea side','3×30 sec ea side','3×40 sec ea side'],
          cue: 'Hold the KB in one hand at your side like a heavy suitcase. Stand tall — DO NOT lean to the opposite side. Walk slowly, keep torso completely vertical. Counter the load with your obliques and QL on the opposite side. If you\'re leaning, the weight is too heavy. Switch sides.' },
      ]},
      { title: 'COOL-DOWN', duration: '3 min', exercises: [
        { id: 'C-d1', name: 'Figure-4 Glute Stretch', equip: 'Floor',
          reps: ['30 sec ea','30 sec ea','45 sec ea','45 sec ea'],
          cue: 'On back, cross ankle over opposite knee. Pull thigh toward chest. Deep glute stretch.', noLog: true },
        { id: 'C-d2', name: 'Child\'s Pose', equip: 'Floor',
          reps: ['60 sec','60 sec','60 sec','60 sec'],
          cue: 'Arms extended. Breathe into your back. You earned this.', noLog: true },
      ]},
    ],
  },

  M: {
    title: 'Day M',
    sub: 'Mobility & Recovery',
    weekday: null, // Not tied to a specific weekday — use any day
    weekdayShort: 'Any',
    weekdayLong: 'Any Day',
    duration: '~20 min',
    equipment: 'Mat · Light Band · TRX · Foam Roller (optional)',
    injection: false,
    notes: 'Use on low-energy days, true rest days, or as a strength-day swap. Move slow, breathe deep.',
    sections: [
      { title: 'WARM-UP', duration: '2 min', exercises: [
        { id: 'M-w1', name: 'Cat-Cow Flow', equip: 'Mat',
          reps: ['2×8','2×10','3×8','3×10'],
          cue: 'On hands and knees. Move segment by segment — pelvis tucks first, then low back, then mid, then neck. Inhale into extension, exhale into flexion. Slow.' },
      ]},
      { title: 'HIPS', duration: '6 min', exercises: [
        { id: 'M-h1', name: '90/90 Hip Switches', equip: 'Mat',
          reps: ['2×6 ea','2×8 ea','3×8 ea','3×10 ea'],
          cue: 'Seated, one leg in front at 90°, other to the side at 90°. Sit tall, then switch sides by rotating the hips, knees brushing the floor. Don\'t use your hands — let your hips do the work.' },
        { id: 'M-h2', name: 'Lizard Lunge w/ T-Spine Rotation', equip: 'Mat',
          reps: ['30 sec ea','45 sec ea','60 sec ea + 5 rotations','60 sec ea + 8 rotations'],
          cue: 'Deep lunge, front foot wide, back knee on floor. Both hands inside front foot. Reach the inside arm up and rotate the chest open toward the ceiling. Slow and controlled.' },
        { id: 'M-h3', name: 'Pigeon Pose', equip: 'Mat',
          reps: ['30 sec ea','45 sec ea','60 sec ea','60 sec ea'],
          cue: 'Front shin angled across the mat, back leg long behind you. Stack hips square. Fold forward only as far as the hip allows — never force it. Breathe into the glute.' },
        { id: 'M-h4', name: 'Couch Stretch', equip: 'Mat + wall/couch',
          reps: ['30 sec ea','45 sec ea','60 sec ea','60 sec ea'],
          cue: 'Half-kneeling facing away from a wall (or couch). Slide the back shin up the wall so the foot is pointing up, knee on the mat or a pad. Front foot planted flat. Tuck the pelvis under and squeeze the back glute — you should feel a deep stretch through the front of the back hip and quad. Don\'t arch the low back. The desk-warrior antidote.' },
      ]},
      { title: 'T-SPINE & SHOULDERS', duration: '5 min', exercises: [
        { id: 'M-t1', name: 'Thread the Needle', equip: 'Mat',
          reps: ['2×5 ea','2×8 ea','3×8 ea','3×10 ea'],
          cue: 'On hands and knees. Reach one arm under and across, lowering the shoulder to the mat. Rotate from the upper back, not the low back. Pause, return, switch.' },
        { id: 'M-t2', name: 'Open Book', equip: 'Mat',
          reps: ['2×6 ea','2×8 ea','3×8 ea','3×10 ea'],
          cue: 'Side-lying, knees stacked and bent 90°, arms extended in front. Rotate the top arm open across your body, eyes follow the hand. Keep the knees pinned together. Move from the spine.' },
        { id: 'M-t3', name: 'Wall Slides', equip: 'Wall',
          reps: ['2×8','2×10','3×10','3×12'],
          cue: 'Back, head, and arms against wall. Slide arms overhead keeping contact. If wrists come off, that\'s your end range — don\'t force it. Slow.' },
        { id: 'M-t4', name: 'Bretzel', equip: 'Mat',
          reps: ['30 sec ea','45 sec ea','60 sec ea','60 sec ea'],
          cue: 'Side-lying, bottom leg straight, top knee bent and pulled toward chest — held by the bottom hand. Reach the top arm behind you and grab the bottom foot if you can (a strap works too). Now rotate the top shoulder toward the floor behind you, looking over the top shoulder. Three stretches in one position: hip flexor, glute, T-spine. Cressey staple. Breathe and let things open — no forcing.' },
      ]},
      { title: 'LOWER LEG', duration: '3 min', exercises: [
        { id: 'M-l1', name: 'Banded Ankle Dorsiflexion', equip: 'Light Band',
          reps: ['2×8 ea','2×10 ea','3×10 ea','3×12 ea'],
          cue: 'Loop band around forefoot, anchor behind you. Sit with leg extended. Pull foot toward shin against band resistance. Trains active dorsiflexion, not just passive stretch.' },
        { id: 'M-l2', name: 'Calf Stretch — Straight & Bent Knee', equip: 'Wall',
          reps: ['20 sec ea position','30 sec ea position','30 sec ea position','45 sec ea position'],
          cue: 'Hands on wall, one foot back with heel down. STRAIGHT back knee for 20–45 sec → hits the gastrocnemius. Then BEND the back knee, heel still down, hold same time → hits the soleus underneath. Two muscles, one stretch. Switch sides. Critical for any hinging, squatting, or walking pattern.' },
      ]},
      { title: 'GLUTE ACTIVATION', duration: '3 min', exercises: [
        { id: 'M-a1', name: 'Clamshells', equip: 'Light Band',
          reps: ['2×10 ea','2×12 ea','3×12 ea','3×15 ea'],
          cue: 'Side-lying, band above knees, heels together. Open the top knee without rocking the pelvis back. Squeeze at the top. This is activation, not max effort — keep it crisp.' },
        { id: 'M-a2', name: 'Glute Bridge — Slow Tempo', equip: 'Bodyweight or Band',
          reps: ['2×8 (3 sec hold)','2×10 (3 sec hold)','3×10 (5 sec hold)','3×12 (5 sec hold)'],
          cue: 'Drive through heels, lift hips. Squeeze at the top and hold. Lower slowly — count it out. Goal is glute activation, not load.' },
      ]},
      { title: 'COOL-DOWN', duration: '2 min', exercises: [
        { id: 'M-d1', name: 'Supine Spinal Twist', equip: 'Mat',
          reps: ['30 sec ea','45 sec ea','60 sec ea','60 sec ea'],
          cue: 'On back, knees to chest, drop them to one side, opposite arm extended out. Look the opposite way. Breathe into the rib expansion.', noLog: true },
        { id: 'M-d2', name: 'Diaphragmatic Breathing', equip: 'Mat',
          reps: ['8 breaths','10 breaths','12 breaths','12 breaths'],
          cue: 'On back, knees bent. One hand on chest, one on belly. Inhale 4 counts into the belly (chest hand stays still), exhale 6 counts. Down-regulates the nervous system.', noLog: true },
      ]},
    ],
  },
};

// Progress tracker — key lifts to log weekly best set
const PROGRESS_GROUPS = [
  { title: 'LOWER BODY', items: [
    { id: 'prog-goblet', name: 'Goblet Squat', goal: '3×12 + vest', metric: 'reps @ 32lb' },
    { id: 'prog-rdl', name: 'KB RDL', goal: '3×12 + vest', metric: 'reps @ 32lb' },
    { id: 'prog-bss', name: 'Bulgarian Split Squat', goal: '3×12 ea + vest', metric: 'reps ea' },
    { id: 'prog-sl-rdl', name: 'Single Leg KB RDL', goal: '3×12 ea + vest', metric: 'reps ea' },
    { id: 'prog-lat-lunge', name: 'Lateral Lunge', goal: '3×10 ea @ KB + light vest', metric: 'reps ea' },
    { id: 'prog-sumo', name: 'KB Sumo Deadlift', goal: '3×12 + vest', metric: 'reps' },
    { id: 'prog-swing', name: 'KB Swing', goal: '3×15 + vest', metric: 'reps' },
  ]},
  { title: 'UPPER BODY', items: [
    { id: 'prog-trxrow', name: 'TRX Row', goal: '3×15 horizontal', metric: 'reps / angle' },
    { id: 'prog-trxpush', name: 'TRX Push-Up', goal: '3×10', metric: 'reps' },
    { id: 'prog-ancore-row', name: 'ANCORE Row', goal: '3×15 @ 45–50 lbs', metric: 'reps @ lbs' },
    { id: 'prog-ancore-pull', name: 'ANCORE Pull-Down', goal: '3×15 @ 45–55 lbs', metric: 'reps @ lbs' },
    { id: 'prog-face-pull', name: 'Face Pull', goal: '3×20 @ 25–30 lbs', metric: 'reps @ lbs' },
    { id: 'prog-sa-pulldown', name: 'Straight Arm Pull-Down', goal: '3×15 @ 25–30 lbs', metric: 'reps @ lbs' },
  ]},
  { title: 'CORE', items: [
    { id: 'prog-plank', name: 'Plank Hold', goal: '3×40 sec', metric: 'seconds' },
    { id: 'prog-sideplank', name: 'Side Plank', goal: '3×30 sec ea', metric: 'seconds each' },
    { id: 'prog-situp', name: 'Straight Leg Sit-Up', goal: '3×12', metric: 'reps' },
    { id: 'prog-pallof', name: 'Pallof Press', goal: '3×15 ea @ 30–35 lbs', metric: 'reps @ lbs' },
    { id: 'prog-chop', name: 'Half-Kneeling ANCORE Chop', goal: '3×12 ea @ 30–35 lbs', metric: 'reps @ lbs' },
    { id: 'prog-suitcase', name: 'Suitcase Carry', goal: '3×40 sec ea side', metric: 'seconds each' },
  ]},
  { title: 'POWER + CONDITIONING', items: [
    { id: 'prog-slam', name: 'Med Ball Slam', goal: '3×15', metric: 'reps' },
    { id: 'prog-jr', name: 'Jump Rope Intervals', goal: '4×45 sec on / 20 off', metric: 'rounds × time' },
  ]},
];

// ============================================================
// DATE / WEEK LOGIC
// ============================================================
function daysBetween(a, b) {
  const ms = b.setHours(0,0,0,0) - a.setHours(0,0,0,0);
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function getCurrentWeek(today = new Date()) {
  const start = new Date(PROGRAM_START);
  const diff = daysBetween(start, new Date(today));
  if (diff < 0) return 0; // pre-program
  const wk = Math.floor(diff / 7) + 1;
  if (wk > 8) return 9; // program complete
  return wk;
}

function getRepBlock(week) {
  // 1-2 → 0, 3-4 → 1, 5-6 → 2, 7-8 → 3
  if (week <= 2) return 0;
  if (week <= 4) return 1;
  if (week <= 6) return 2;
  return 3;
}

function getPhase(week) {
  return week <= 4 ? 1 : 2;
}

function getTodayDayKey(today = new Date()) {
  const wd = today.getDay();
  if (wd === 2) return 'A';
  if (wd === 4) return 'B';
  if (wd === 6) return 'C';
  return null; // rest day
}

function getNextWorkout(today = new Date()) {
  const wd = today.getDay();
  // Next workout day index (0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat)
  const order = [
    { d: 2, key: 'A' },
    { d: 4, key: 'B' },
    { d: 6, key: 'C' },
  ];
  for (const o of order) {
    if (o.d > wd) {
      const dt = new Date(today);
      dt.setDate(dt.getDate() + (o.d - wd));
      return { key: o.key, date: dt };
    }
  }
  // wrap to next week Tuesday
  const dt = new Date(today);
  dt.setDate(dt.getDate() + ((2 + 7 - wd) % 7 || 7));
  return { key: 'A', date: dt };
}

function getSessionDate(dayKey, week) {
  // Program week starts on Tuesday with Day A. Wk N Day A = PROGRAM_START + (N-1)*7 days.
  // Within a week: Day A = day 0 (Tue), Day B = day 2 (Thu), Day C = day 4 (Sat)
  const anchor = new Date(PROGRAM_START);
  anchor.setDate(anchor.getDate() + (week - 1) * 7);
  const offset = dayKey === 'A' ? 0 : dayKey === 'B' ? 2 : 4;
  const dt = new Date(anchor);
  dt.setDate(dt.getDate() + offset);
  return dt;
}

function fmtDate(dt) {
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ============================================================
// STORAGE
// ============================================================
const STORAGE = {
  setLog(week, dayKey, exId, data) {
    localStorage.setItem(`log:wk${week}:${dayKey}:${exId}`, JSON.stringify(data));
  },
  getLog(week, dayKey, exId) {
    const v = localStorage.getItem(`log:wk${week}:${dayKey}:${exId}`);
    return v ? JSON.parse(v) : null;
  },
  setProgress(itemId, week, value) {
    localStorage.setItem(`prog:${itemId}:wk${week}`, value);
  },
  getProgress(itemId, week) {
    return localStorage.getItem(`prog:${itemId}:wk${week}`) || '';
  },
  isDone(week, dayKey, exId) {
    const log = this.getLog(week, dayKey, exId);
    return log && log.completed;
  },
  // Session-level notes (one per workout day per week)
  setSessionNote(week, dayKey, text) {
    const k = `sess-note:wk${week}:${dayKey}`;
    if (text && text.trim()) localStorage.setItem(k, text);
    else localStorage.removeItem(k);
  },
  getSessionNote(week, dayKey) {
    return localStorage.getItem(`sess-note:wk${week}:${dayKey}`) || '';
  },
  // Program customization (the entire DAYS object, edited by the user)
  saveProgram(days) {
    localStorage.setItem('program-v1', JSON.stringify(days));
  },
  loadProgram() {
    const v = localStorage.getItem('program-v1');
    return v ? JSON.parse(v) : null;
  },
  resetProgram() {
    localStorage.removeItem('program-v1');
  },
};

// Mutable program — seeded from DEFAULT_DAYS, but user edits persist to localStorage
let DAYS = STORAGE.loadProgram() || JSON.parse(JSON.stringify(DEFAULT_DAYS));

// Migration: if stored program is missing any day defined in DEFAULT_DAYS, merge it in.
// This preserves user edits to existing days while adding newly introduced ones (e.g. Day M).
(function migrateDays() {
  let migrated = false;
  for (const k of Object.keys(DEFAULT_DAYS)) {
    if (!DAYS[k]) {
      DAYS[k] = JSON.parse(JSON.stringify(DEFAULT_DAYS[k]));
      migrated = true;
    }
  }
  if (migrated) STORAGE.saveProgram(DAYS);
})();

// Migration: ANCORE rebrand. Update old "Anchor Pulley" generic-band cues to real ANCORE
// cues + plate-based rep prescriptions. Field-by-field: only replace values that still
// match the prior defaults (so user edits are preserved).
(function migrateAncoreV1() {
  if (localStorage.getItem('migration:ancore-v1')) return;

  const findEx = (exId) => {
    for (const dayKey of Object.keys(DAYS)) {
      for (const section of (DAYS[dayKey].sections || [])) {
        const ex = section.exercises.find(e => e.id === exId);
        if (ex) return ex;
      }
    }
    return null;
  };

  const updates = [
    { id: 'B-p2',
      oldDefaults: {
        name: 'Anchor Pulley Row',
        equip: 'Bands + Pulley',
        reps: ['2×10','3×12','3×12 heavier band','3×15 heavier band'],
        cue: 'Hinge slightly at hips. Pull band to belly button. Controlled release — 3 count out.'
      },
      newValues: {
        name: 'ANCORE Row',
        equip: 'ANCORE + plates',
        reps: ['2×10 @ 15–20 lbs','3×12 @ 25–30 lbs','3×12 @ 35–40 lbs','3×15 @ 45–50 lbs'],
        cue: 'Mount ANCORE at mid-rack height. Single handle. Hinge slightly at hips, brace core. Pull handle to belly button — elbow drives back, squeeze the shoulder blade. Control the return — 3 count out. Track actual load in your set log.'
      }
    },
    { id: 'B-u2',
      oldDefaults: {
        name: 'Anchor Pulley Chest Press',
        equip: 'Bands + Pulley',
        reps: ['2×10','3×12','3×12 heavier band','3×15 heavier band'],
        cue: 'Anchor at chest height. Press forward and slightly down. Control the return.'
      },
      newValues: {
        name: 'ANCORE Chest Press',
        equip: 'ANCORE + plates',
        reps: ['2×10 @ 15–20 lbs','3×12 @ 25–30 lbs','3×12 @ 30–40 lbs','3×15 @ 40–50 lbs'],
        cue: 'Mount ANCORE at mid-rack height (about chest level when standing). Face away from the rack. Step forward until the cable is taut at the start. Press the handle forward, elbow tucks slightly. Control the return.'
      }
    },
    { id: 'C-u2',
      oldDefaults: {
        name: 'Anchor Pulley Pull-Down',
        equip: 'Bands + Pulley',
        reps: ['2×10','3×12','3×12 heavier band','3×15 heavier band'],
        cue: 'Anchor high. Kneel or stand. Pull elbows down to ribs. Lat focus. Slow release.'
      },
      newValues: {
        name: 'ANCORE Pull-Down',
        equip: 'ANCORE + plates',
        reps: ['2×10 @ 15–20 lbs','3×12 @ 25–30 lbs','3×12 @ 35–45 lbs','3×15 @ 45–55 lbs'],
        cue: 'Mount ANCORE high on the rack. Single handle. Kneel facing the unit (or stand if you can keep the cable line). Pull handle down and slightly out to your ribs — lat focus, not biceps. Slow release. Don\'t shrug at the top of the return.'
      }
    },
  ];

  let changed = false;
  for (const u of updates) {
    const ex = findEx(u.id);
    if (!ex) continue;
    for (const field of Object.keys(u.oldDefaults)) {
      if (JSON.stringify(ex[field]) === JSON.stringify(u.oldDefaults[field])) {
        ex[field] = u.newValues[field];
        changed = true;
      }
    }
  }

  // Also migrate Day B + Day C equipment strings if still on the old defaults
  if (DAYS.B && DAYS.B.equipment === 'TRX · Anchor Pulley + Bands · KB 32lb · Jump Rope') {
    DAYS.B.equipment = 'TRX · ANCORE (1 unit, up to 55 lbs) · KB 32lb · Jump Rope';
    changed = true;
  }
  if (DAYS.C && DAYS.C.equipment === 'KB 32lb · TRX · Bands · Stepper · Jump Rope · Slam Ball · Vest (Wk 5+)') {
    DAYS.C.equipment = 'KB 32lb · TRX · ANCORE · Bands · Stepper · Jump Rope · Slam Ball · Vest (Wk 5+)';
    changed = true;
  }

  if (changed) STORAGE.saveProgram(DAYS);
  localStorage.setItem('migration:ancore-v1', '1');
})();

// Migration v2: Add attachment-based functional exercises (Face Pull, Straight Arm
// Pull-Down, Cable Hip Abduction, Cable Hip Kickback) to existing stored programs.
// Also update ANCORE equip strings to specify attachments (single handle / straight bar).
// Field-by-field check preserves user edits.
(function migrateAncoreAttachments() {
  if (localStorage.getItem('migration:ancore-attachments')) return;

  const findExWithSection = (exId) => {
    for (const dayKey of Object.keys(DAYS)) {
      for (const section of (DAYS[dayKey].sections || [])) {
        const idx = section.exercises.findIndex(e => e.id === exId);
        if (idx !== -1) return { section, idx };
      }
    }
    return null;
  };
  const findSection = (dayKey, sectionTitle) => {
    const d = DAYS[dayKey];
    if (!d) return null;
    return (d.sections || []).find(s => s.title === sectionTitle) || null;
  };
  const exExists = (exId) => !!findExWithSection(exId);

  let changed = false;

  // Update equip strings on already-migrated ANCORE exercises (v1 defaulted them to "ANCORE + plates")
  const equipUpdates = [
    { id: 'B-p2', from: 'ANCORE + plates', to: 'ANCORE + single handle' },
    { id: 'B-u2', from: 'ANCORE + plates', to: 'ANCORE + single handle' },
    { id: 'C-u2', from: 'ANCORE + plates', to: 'ANCORE + straight bar' },
  ];
  for (const u of equipUpdates) {
    const f = findExWithSection(u.id);
    if (f && f.section.exercises[f.idx].equip === u.from) {
      f.section.exercises[f.idx].equip = u.to;
      changed = true;
    }
  }

  // Update Pull-Down cue from v1 default to mention straight bar (only if still default)
  const pulldownV1Cue = 'Mount ANCORE high on the rack. Single handle. Kneel facing the unit (or stand if you can keep the cable line). Pull handle down and slightly out to your ribs — lat focus, not biceps. Slow release. Don\'t shrug at the top of the return.';
  const f = findExWithSection('C-u2');
  if (f && f.section.exercises[f.idx].cue === pulldownV1Cue) {
    f.section.exercises[f.idx].cue = 'Mount ANCORE high on the rack with the straight bar attachment (wider grip = more lats, less biceps). Kneel facing the unit. Pull the bar down to your upper chest — elbows drive down and out, lat focus. Slow release. Don\'t shrug at the top of the return.';
    changed = true;
  }

  // New exercises to add if missing (matched by ID).
  const newExercises = [
    { dayKey: 'A', sectionTitle: 'LOWER BODY', ex: {
      id: 'A-l6', name: 'Cable Hip Abduction', equip: 'ANCORE + ankle attachment',
      reps: ['2×10 ea @ 5–10 lbs','3×12 ea @ 10–15 lbs','3×12 ea @ 15–20 lbs','3×15 ea @ 20–25 lbs'],
      cue: 'Ankle strap on the working leg. Mount ANCORE low on the side opposite the working leg. Stand sideways, hand on the rack for balance. Lift the working leg out to the side — drive from the glute medius, not the hip flexor. Don\'t lean. Slow controlled return. Real glute med isolation that bands can\'t match at this load.'
    }},
    { dayKey: 'A', sectionTitle: 'LOWER BODY', ex: {
      id: 'A-l7', name: 'Cable Hip Kickback', equip: 'ANCORE + ankle attachment',
      reps: ['2×10 ea @ 5–10 lbs','3×12 ea @ 10–15 lbs','3×12 ea @ 15–20 lbs','3×15 ea @ 20–25 lbs'],
      cue: 'Ankle strap on the working leg. Mount ANCORE low, face the rack. Hold the rack for balance. Drive the working leg straight back, squeezing the glute hard at the top. Keep core braced — don\'t arch your low back to compensate. Slow controlled return. Direct glute max work.'
    }},
    { dayKey: 'B', sectionTitle: 'UPPER BODY — PULL', ex: {
      id: 'B-p3', name: 'Face Pull', equip: 'ANCORE + tricep rope',
      reps: ['2×12 @ 10–15 lbs','3×15 @ 15–20 lbs','3×15 @ 20–25 lbs','3×20 @ 25–30 lbs'],
      cue: 'Tricep rope on ANCORE, mounted at upper-chest / face height. Grip both ends of the rope. Pull rope toward your face, separating your hands as you pull — finish with elbows high, hands by your ears, palms facing forward (external rotation). Lighter load, high reps. This one bulletproofs your shoulders against all the pressing work.'
    }},
    { dayKey: 'B', sectionTitle: 'UPPER BODY — PULL', ex: {
      id: 'B-p4', name: 'Straight Arm Pull-Down', equip: 'ANCORE + straight bar',
      reps: ['2×10 @ 10–15 lbs','3×12 @ 15–20 lbs','3×12 @ 20–25 lbs','3×15 @ 25–30 lbs'],
      cue: 'Straight bar on ANCORE, mounted high. Stand back from the rack, hinge slightly at the hips, arms straight overhead gripping the bar. Keep a SOFT bend at the elbow but lock it — no bicep curl. Drive the bar down in a wide arc to your thighs using only your lats and teres major. Squeeze hard at the bottom. Core braced throughout — this trains anti-extension too. Slow controlled return overhead.'
    }},
  ];

  for (const item of newExercises) {
    if (exExists(item.ex.id)) continue;
    const section = findSection(item.dayKey, item.sectionTitle);
    if (!section) continue;
    section.exercises.push(item.ex);
    changed = true;
  }

  if (changed) STORAGE.saveProgram(DAYS);
  localStorage.setItem('migration:ancore-attachments', '1');
})();

// Migration v3: Add functional staples per Boyle/Cressey/Sims philosophy.
// Bulgarian Split Squat, Single Leg KB RDL (Day A), Pallof Press, Suitcase Carry (Day C).
// Idempotent — only adds if exercise ID not already present.
(function migrateFunctionalStaples() {
  if (localStorage.getItem('migration:functional-staples')) return;

  const findExWithSection = (exId) => {
    for (const dayKey of Object.keys(DAYS)) {
      for (const section of (DAYS[dayKey].sections || [])) {
        const idx = section.exercises.findIndex(e => e.id === exId);
        if (idx !== -1) return { section, idx };
      }
    }
    return null;
  };
  const findSection = (dayKey, sectionTitle) => {
    const d = DAYS[dayKey];
    if (!d) return null;
    return (d.sections || []).find(s => s.title === sectionTitle) || null;
  };

  const newExercises = [
    { dayKey: 'A', sectionTitle: 'LOWER BODY', ex: {
      id: 'A-l8', name: 'Bulgarian Split Squat', equip: 'KB 32lb + bench',
      reps: ['2×8 ea bodyweight','3×8 ea @ KB 32lb','3×10 ea + light vest','3×12 ea + vest'],
      cue: 'Rear foot elevated on a bench/chair behind you. Front foot far enough forward that your knee tracks over toes — not past. KB held goblet at chest (or one in each hand). Lower straight down — back knee toward floor, not back. Drive through the front heel. ~80% of load lives on the front leg. Boyle gospel.'
    }},
    { dayKey: 'A', sectionTitle: 'LOWER BODY', ex: {
      id: 'A-l9', name: 'Single Leg KB RDL', equip: 'KB 32lb',
      reps: ['2×8 ea @ KB 32lb','3×8 ea','3×10 ea + light vest','3×12 ea + vest'],
      cue: 'KB in the OPPOSITE hand from the working leg (better counterbalance). Soft bend in the working knee — don\'t lock it. Hinge at the hip, free leg extends straight back, body forms a T shape parallel to floor. KB tracks down close to the working leg. Squeeze the working glute to return. Balance is the point — go slow, set the foot down between reps if needed.'
    }},
    { dayKey: 'C', sectionTitle: 'CORE', ex: {
      id: 'C-c4', name: 'Pallof Press', equip: 'ANCORE + single handle',
      reps: ['2×10 ea @ 15–20 lbs','3×12 ea @ 20–25 lbs','3×12 ea @ 25–30 lbs','3×15 ea @ 30–35 lbs'],
      cue: 'Mount ANCORE at chest height. Stand perpendicular to the rack with the handle pressed into your chest with both hands. Brace core hard. Press the handle straight out in front of you — the cable will try to rotate you toward the rack. RESIST. Hold 2–3 sec at full extension. Slow return. Anti-rotation core — Cressey signature. Counts are per side.'
    }},
    { dayKey: 'C', sectionTitle: 'CORE', ex: {
      id: 'C-c5', name: 'Suitcase Carry', equip: 'KB 32lb',
      reps: ['2×20 sec ea side','2×30 sec ea side','3×30 sec ea side','3×40 sec ea side'],
      cue: 'Hold the KB in one hand at your side like a heavy suitcase. Stand tall — DO NOT lean to the opposite side. Walk slowly, keep torso completely vertical. Counter the load with your obliques and QL on the opposite side. If you\'re leaning, the weight is too heavy. Switch sides.'
    }},
  ];

  let changed = false;
  for (const item of newExercises) {
    if (findExWithSection(item.ex.id)) continue;
    const section = findSection(item.dayKey, item.sectionTitle);
    if (!section) continue;
    section.exercises.push(item.ex);
    changed = true;
  }

  if (changed) STORAGE.saveProgram(DAYS);
  localStorage.setItem('migration:functional-staples', '1');
})();

// Migration v4: Mobility-first overhaul.
// 1) Remove "Cable Hip Abduction" (A-l6) and "Med Ball Russian Twist" (C-c2) — non-functional.
// 2) Add Lateral Lunge (A-l10) to Day A LOWER BODY.
// 3) Add Half-Kneeling ANCORE Chop (C-c6) to Day C CORE.
// 4) Insert "MOBILITY PREP" section into Days A, B, C between WARM-UP and the first work section.
// 5) Extend Day M with Couch Stretch, Bretzel, Calf Stretch.
// Idempotent — checks by ID and section title before mutating.
(function migrateMobilityFirst() {
  if (localStorage.getItem('migration:mobility-first-v1')) return;

  const findExWithSection = (exId) => {
    for (const dayKey of Object.keys(DAYS)) {
      for (const section of (DAYS[dayKey].sections || [])) {
        const idx = section.exercises.findIndex(e => e.id === exId);
        if (idx !== -1) return { dayKey, section, idx };
      }
    }
    return null;
  };
  const findSection = (dayKey, sectionTitle) => {
    const d = DAYS[dayKey];
    if (!d) return null;
    return (d.sections || []).find(s => s.title === sectionTitle) || null;
  };
  const hasSection = (dayKey, sectionTitle) => !!findSection(dayKey, sectionTitle);

  let changed = false;

  // 1) Remove deprecated exercises by ID — preserves log history (it lives under exId keys in STORAGE),
  //    just hides the card from the active workout.
  const toRemove = ['A-l6', 'C-c2'];
  for (const exId of toRemove) {
    const f = findExWithSection(exId);
    if (f) {
      f.section.exercises.splice(f.idx, 1);
      changed = true;
    }
  }

  // 2) Update durations on the strength days to reflect added prep section
  if (DAYS.A && (DAYS.A.duration === '~30 min' || DAYS.A.duration === '30 min')) {
    DAYS.A.duration = '~35 min'; changed = true;
  }
  if (DAYS.A && !/Mat/i.test(DAYS.A.equipment || '')) {
    DAYS.A.equipment = (DAYS.A.equipment || '') + ' · Mat'; changed = true;
  }
  if (DAYS.B && (DAYS.B.duration === '~30 min' || DAYS.B.duration === '30 min')) {
    DAYS.B.duration = '~33 min'; changed = true;
  }
  if (DAYS.B && !/Mat|Wall/i.test(DAYS.B.equipment || '')) {
    DAYS.B.equipment = (DAYS.B.equipment || '') + ' · Mat / Wall'; changed = true;
  }
  if (DAYS.C && (DAYS.C.duration === '~35 min' || DAYS.C.duration === '35 min')) {
    DAYS.C.duration = '~38 min'; changed = true;
  }
  if (DAYS.C && !/Mat/i.test(DAYS.C.equipment || '')) {
    DAYS.C.equipment = (DAYS.C.equipment || '') + ' · Mat'; changed = true;
  }

  // 3) Insert MOBILITY PREP sections (skip if already present)
  const insertMobilityPrep = (dayKey, prepSection) => {
    const d = DAYS[dayKey];
    if (!d || !d.sections) return;
    if (d.sections.some(s => s.title === 'MOBILITY PREP')) return;
    // Find WARM-UP index, insert after
    const warmIdx = d.sections.findIndex(s => s.title === 'WARM-UP');
    const insertAt = warmIdx === -1 ? 0 : warmIdx + 1;
    d.sections.splice(insertAt, 0, prepSection);
    changed = true;
  };

  insertMobilityPrep('A', { title: 'MOBILITY PREP', duration: '3 min', exercises: [
    { id: 'A-mp1', name: 'World\'s Greatest Stretch', equip: 'Mat',
      reps: ['2×5 ea','2×6 ea','3×6 ea','3×8 ea'],
      cue: 'Step into a deep lunge, back knee hovering. Drop the same-side hand to the floor inside the front foot. Reach the other arm up and rotate the chest open toward the ceiling. Lower hand, switch reach, then step back to push-up position and switch sides. Hits hip flexors, hamstrings, T-spine in one shot — primes everything below.', noLog: true },
    { id: 'A-mp2', name: '90/90 Hip Roll', equip: 'Mat',
      reps: ['2×6 ea','2×8 ea','3×8 ea','3×10 ea'],
      cue: 'Seated, one leg in front at 90°, other to the side at 90°. Sit tall — hands off the floor. Drive the back knee down to the floor and rotate the hips to switch sides. Slow and controlled. Wakes up hip internal and external rotation before squatting.', noLog: true },
  ]});

  insertMobilityPrep('B', { title: 'MOBILITY PREP', duration: '3 min', exercises: [
    { id: 'B-mp1', name: 'Wall Slides', equip: 'Wall',
      reps: ['2×8','2×10','3×10','3×12'],
      cue: 'Back, head, and arms against wall. Slide arms overhead keeping wrists and elbows in contact with the wall. If wrists come off, that\'s your end range — don\'t force it. Trains scap upward rotation and overhead position before any pulling or pressing.', noLog: true },
    { id: 'B-mp2', name: 'Open Book', equip: 'Mat',
      reps: ['2×6 ea','2×8 ea','3×8 ea','3×10 ea'],
      cue: 'Side-lying, knees stacked and bent 90° (top knee anchored), arms extended in front. Rotate the top arm open across your body, eyes follow the hand. Keep the knees pinned together — rotation comes from the spine, not the hips. Critical T-spine prep for rowing and pressing.', noLog: true },
  ]});

  insertMobilityPrep('C', { title: 'MOBILITY PREP', duration: '3 min', exercises: [
    { id: 'C-mp1', name: 'World\'s Greatest Stretch w/ T-Spine Reach', equip: 'Mat',
      reps: ['2×5 ea','2×6 ea','3×6 ea','3×8 ea'],
      cue: 'Deep lunge, back knee hovering. Same-side hand inside the front foot. Reach the OTHER arm to the ceiling and rotate the chest open — eyes follow the hand. Lower, switch reach, step back, switch sides. Prime mover for hinge patterns — opens the hip flexors and unlocks T-spine before swings and RDLs.', noLog: true },
    { id: 'C-mp2', name: 'Hip Airplane', equip: 'Bodyweight (wall optional)',
      reps: ['2×5 ea','2×6 ea','3×6 ea','3×8 ea'],
      cue: 'Stand on one leg, soft knee bend. Hinge forward into a single-leg RDL position — body in a T shape. From there, slowly rotate the pelvis open (free leg drifts toward the wall behind you) then closed. That\'s one rep. Touch the wall for balance if needed. This is your single-leg RDL insurance policy — trains hip control and rotation under tension.', noLog: true },
  ]});

  // 4) Add new strength-day exercises (Lateral Lunge, Half-Kneeling Chop)
  const newStrengthExercises = [
    { dayKey: 'A', sectionTitle: 'LOWER BODY', ex: {
      id: 'A-l10', name: 'Lateral Lunge', equip: 'KB 32lb',
      reps: ['2×6 ea bodyweight','3×8 ea bodyweight','3×8 ea @ KB 32lb','3×10 ea @ KB + light vest'],
      cue: 'Hold KB at chest (goblet). Stand tall, feet together. Step wide to one side and sit back into that hip — load the working leg, keep the opposite leg straight with toes pointing forward. Chest tall, weight in mid-foot/heel of working leg. Drive through the working heel to return to center. Trains the frontal plane and adductors that bands and machines miss. Boyle-style functional glute med work.'
    }},
    { dayKey: 'C', sectionTitle: 'CORE', ex: {
      id: 'C-c6', name: 'Half-Kneeling ANCORE Chop', equip: 'ANCORE + single handle',
      reps: ['2×8 ea @ 15–20 lbs','3×10 ea @ 20–25 lbs','3×10 ea @ 25–30 lbs','3×12 ea @ 30–35 lbs'],
      cue: 'Mount ANCORE high on the rack. Kneel perpendicular to the unit — outside knee down, inside knee up (90°). Grab handle with both hands at the high shoulder. Pull the handle DOWN and ACROSS the body to the outside hip in a chopping arc — arms stay relatively straight, the rotation drives from the obliques, not the arms. Core braced hard the whole time — the cable wants to pull you back toward the rack. Slow controlled return. This is anti-rotation expressed as rotation — Cressey signature. Counts are per side.'
    }},
  ];
  for (const item of newStrengthExercises) {
    if (findExWithSection(item.ex.id)) continue;
    const section = findSection(item.dayKey, item.sectionTitle);
    if (!section) continue;
    // Chop should land before Side Plank/Suitcase Carry — insert at start of CORE if it's the chop
    if (item.ex.id === 'C-c6') {
      section.exercises.unshift(item.ex);
    } else {
      section.exercises.push(item.ex);
    }
    changed = true;
  }

  // 5) Extend Day M
  const dayMAdds = [
    { sectionTitle: 'HIPS', after: 'M-h3', ex: {
      id: 'M-h4', name: 'Couch Stretch', equip: 'Mat + wall/couch',
      reps: ['30 sec ea','45 sec ea','60 sec ea','60 sec ea'],
      cue: 'Half-kneeling facing away from a wall (or couch). Slide the back shin up the wall so the foot is pointing up, knee on the mat or a pad. Front foot planted flat. Tuck the pelvis under and squeeze the back glute — you should feel a deep stretch through the front of the back hip and quad. Don\'t arch the low back. The desk-warrior antidote.'
    }},
    { sectionTitle: 'T-SPINE & SHOULDERS', after: 'M-t3', ex: {
      id: 'M-t4', name: 'Bretzel', equip: 'Mat',
      reps: ['30 sec ea','45 sec ea','60 sec ea','60 sec ea'],
      cue: 'Side-lying, bottom leg straight, top knee bent and pulled toward chest — held by the bottom hand. Reach the top arm behind you and grab the bottom foot if you can (a strap works too). Now rotate the top shoulder toward the floor behind you, looking over the top shoulder. Three stretches in one position: hip flexor, glute, T-spine. Cressey staple. Breathe and let things open — no forcing.'
    }},
    { sectionTitle: 'LOWER LEG', after: 'M-l1', ex: {
      id: 'M-l2', name: 'Calf Stretch — Straight & Bent Knee', equip: 'Wall',
      reps: ['20 sec ea position','30 sec ea position','30 sec ea position','45 sec ea position'],
      cue: 'Hands on wall, one foot back with heel down. STRAIGHT back knee for 20–45 sec → hits the gastrocnemius. Then BEND the back knee, heel still down, hold same time → hits the soleus underneath. Two muscles, one stretch. Switch sides. Critical for any hinging, squatting, or walking pattern.'
    }},
  ];
  for (const add of dayMAdds) {
    if (findExWithSection(add.ex.id)) continue;
    const section = findSection('M', add.sectionTitle);
    if (!section) continue;
    const afterIdx = section.exercises.findIndex(e => e.id === add.after);
    if (afterIdx === -1) {
      section.exercises.push(add.ex);
    } else {
      section.exercises.splice(afterIdx + 1, 0, add.ex);
    }
    changed = true;
  }

  // Bump LOWER LEG duration since we added a stretch
  const lowerLeg = findSection('M', 'LOWER LEG');
  if (lowerLeg && lowerLeg.duration === '2 min') {
    lowerLeg.duration = '3 min';
    changed = true;
  }

  if (changed) STORAGE.saveProgram(DAYS);
  localStorage.setItem('migration:mobility-first-v1', '1');
})();

function saveProgramAndRerender() {
  STORAGE.saveProgram(DAYS);
  renderWorkout();
}

// ============================================================
// STATE
// ============================================================
const STATE = {
  view: 'workout',
  selectedDay: null, // 'A' | 'B' | 'C'
  selectedWeek: null,
  todayKey: null,
  todayWeek: null,
};

// ============================================================
// RENDER
// ============================================================
function renderTopbar() {
  document.getElementById('weekNum').textContent = STATE.selectedWeek;
  const phase = getPhase(STATE.selectedWeek);
  const pill = document.getElementById('phasePill');
  pill.textContent = `PHASE ${phase}`;
  pill.classList.toggle('phase-2', phase === 2);

  document.querySelectorAll('.day-tab').forEach(tab => {
    const d = tab.dataset.day;
    tab.classList.toggle('active', d === STATE.selectedDay);
    tab.classList.toggle('today', d === STATE.todayKey && STATE.selectedWeek === STATE.todayWeek);
  });
}

function renderWorkout() {
  const v = document.getElementById('view-workout');
  v.innerHTML = '';

  // Pre-program
  if (STATE.selectedWeek === 0) {
    v.innerHTML = `<div class="rest-day"><div class="rest-icon">⌃</div><h1 class="display">Program Starts Soon</h1><p>First session: Tue May 19, 2026 — Day A (Lower Body)</p></div>`;
    return;
  }
  if (STATE.selectedWeek === 9) {
    v.innerHTML = `<div class="rest-day"><div class="rest-icon" style="color: var(--done); border-color: var(--done);">✓</div><h1 class="display">Program Complete</h1><p>8 weeks done. Look back at your Progress tab.</p></div>`;
    return;
  }

  // Rest day (and the user is viewing today, not exploring)
  const isToday = STATE.selectedWeek === STATE.todayWeek && STATE.selectedDay === STATE.todayKey;
  const isRestDay = STATE.todayKey === null;
  // Note: even on rest day, we still render the selected workout day (user can tap a tab)
  // The rest-day view only shows when no day is selected (which shouldn't happen — we always pick a day)

  const day = DAYS[STATE.selectedDay];
  const repIdx = getRepBlock(STATE.selectedWeek);
  const hasWeekday = day.weekday !== null && day.weekday !== undefined;
  const sessionDate = hasWeekday ? getSessionDate(STATE.selectedDay, STATE.selectedWeek) : null;

  // Header
  const header = document.createElement('div');
  header.className = 'day-header';
  const todayBadge = (hasWeekday && isToday) ? `<span style="color: var(--accent); font-size: 11px; letter-spacing: 0.18em; margin-left: 8px;">· TODAY</span>` : '';
  const focusLine = hasWeekday
    ? `${esc(day.weekdayLong.toUpperCase())} · ${esc(fmtDate(sessionDate).toUpperCase())}${todayBadge}`
    : `${esc(day.weekdayLong.toUpperCase())} · WK ${STATE.selectedWeek} · PHASE ${getPhase(STATE.selectedWeek)}`;
  header.innerHTML = `
    <div class="focus">${focusLine}</div>
    <h1 class="display">${esc(day.title)}<span class="sub">${esc(day.sub)}</span></h1>
    <div class="session-meta">
      ${esc(day.duration)} · ${esc(day.equipment)}
      ${day.injection ? '<span class="injection-tag">💉 Injection Day</span>' : ''}
    </div>
    ${day.notes ? `<div class="session-meta" style="margin-top: 6px; font-style: italic;">${esc(day.notes)}</div>` : ''}
  `;
  v.appendChild(header);

  // Session-level notes (one per workout day per week)
  const noteBlock = document.createElement('div');
  noteBlock.className = 'session-notes-block';
  noteBlock.innerHTML = `
    <label class="session-notes-label">SESSION NOTES — WK ${STATE.selectedWeek} ${esc(day.title)}</label>
    <textarea class="session-notes-input" placeholder="How did today go? Energy, mood, weather, anything off…">${esc(STORAGE.getSessionNote(STATE.selectedWeek, STATE.selectedDay))}</textarea>
  `;
  noteBlock.querySelector('textarea').addEventListener('input', (e) => {
    STORAGE.setSessionNote(STATE.selectedWeek, STATE.selectedDay, e.target.value);
  });
  v.appendChild(noteBlock);

  // Completion banner if all loggable exercises done
  const loggables = day.sections.flatMap(s => s.exercises.filter(e => !e.noLog));
  const doneCount = loggables.filter(e => STORAGE.isDone(STATE.selectedWeek, STATE.selectedDay, e.id)).length;
  if (loggables.length > 0 && doneCount === loggables.length) {
    const banner = document.createElement('div');
    banner.className = 'complete-banner';
    banner.innerHTML = `<div class="ck">✓</div><div class="txt">Session complete</div><div class="sub2">${loggables.length} exercises logged — nice work.</div>`;
    v.appendChild(banner);
  }

  // Sections
  day.sections.forEach((section, sIdx) => {
    const secEl = document.createElement('section');
    secEl.className = 'section';
    secEl.innerHTML = `<div class="section-head"><div class="title">${esc(section.title)}</div>${section.duration ? `<div class="duration">${esc(section.duration)}</div>` : ''}</div>`;
    section.exercises.forEach(ex => {
      secEl.appendChild(renderExercise(ex, repIdx));
    });
    // "Add Exercise" button per section
    const addBtn = document.createElement('button');
    addBtn.className = 'add-ex-btn';
    addBtn.innerHTML = '+ Add Exercise';
    addBtn.addEventListener('click', () => openAddExerciseForm(secEl, section));
    secEl.appendChild(addBtn);
    v.appendChild(secEl);
  });
}

// Open inline "add exercise" form within a section element
function openAddExerciseForm(secEl, section) {
  // Don't double-open
  if (secEl.querySelector('.add-ex-form')) return;
  const form = document.createElement('div');
  form.className = 'ex add-ex-form editing';
  form.innerHTML = `
    <div class="ex-edit-form">
      <div class="edit-title">Add Exercise</div>
      <div class="edit-row"><label>NAME</label><input type="text" data-edit="name" placeholder="e.g., Banded Pull-Apart"></div>
      <div class="edit-row"><label>EQUIPMENT</label><input type="text" data-edit="equip" placeholder="e.g., Band"></div>
      <div class="edit-row-group">
        <div class="edit-row-group-label">SETS × REPS BY PHASE</div>
        <div class="edit-row tight"><label>Wk 1–2</label><input type="text" data-edit="rep0" placeholder="2×10"></div>
        <div class="edit-row tight"><label>Wk 3–4</label><input type="text" data-edit="rep1" placeholder="3×10"></div>
        <div class="edit-row tight"><label>Wk 5–6</label><input type="text" data-edit="rep2" placeholder="3×12"></div>
        <div class="edit-row tight"><label>Wk 7–8</label><input type="text" data-edit="rep3" placeholder="3×15"></div>
      </div>
      <div class="edit-row col"><label>COACHING CUE (optional)</label><textarea data-edit="cue" rows="3" placeholder="Form notes, what to focus on…"></textarea></div>
      <div class="edit-actions">
        <button class="edit-btn save">Add</button>
        <button class="edit-btn cancel">Cancel</button>
      </div>
    </div>
  `;
  // Insert before the "+ Add Exercise" button
  secEl.insertBefore(form, secEl.querySelector('.add-ex-btn'));

  form.querySelector('.save').addEventListener('click', () => {
    const get = sel => form.querySelector(`[data-edit="${sel}"]`).value.trim();
    const name = get('name');
    if (!name) { alert('Name is required.'); return; }
    const newEx = {
      id: 'custom-' + Date.now(),
      name,
      equip: get('equip'),
      reps: [get('rep0') || '—', get('rep1') || '—', get('rep2') || '—', get('rep3') || '—'],
      cue: get('cue'),
    };
    section.exercises.push(newEx);
    saveProgramAndRerender();
  });

  form.querySelector('.cancel').addEventListener('click', () => {
    form.remove();
  });

  // Auto-focus the name field
  setTimeout(() => form.querySelector('[data-edit="name"]').focus(), 50);
}

function renderExercise(ex, repIdx) {
  const done = STORAGE.isDone(STATE.selectedWeek, STATE.selectedDay, ex.id);
  const log = STORAGE.getLog(STATE.selectedWeek, STATE.selectedDay, ex.id) || {};
  const card = document.createElement('div');
  card.className = 'ex' + (done ? ' done' : '');
  card.dataset.exId = ex.id;

  const showLog = !ex.noLog;
  const renderViewMode = () => {
    card.innerHTML = `
      <button class="ex-edit-btn" title="Edit">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
      <div class="ex-head">
        <div class="ex-main">
          <div class="ex-name">${esc(ex.name)}</div>
          <div class="ex-equip">${esc(ex.equip)}</div>
        </div>
        <div class="ex-reps"><div class="reps-big">${esc(ex.reps[repIdx])}</div></div>
      </div>
      ${ex.cue ? `<div class="ex-cue">${esc(ex.cue)}</div>` : ''}
      ${showLog ? `
        <div class="ex-actions">
          <button class="ex-action expand-btn">${log.set1 || log.set2 || log.set3 || log.notes ? 'Edit Log' : 'Log Sets'}</button>
          <button class="ex-action complete ${done ? 'done' : ''}">${done ? '✓ Done' : 'Mark Done'}</button>
        </div>
        <div class="ex-log">
          <div class="set-row"><label>SET 1</label><input type="text" data-field="set1" inputmode="text" placeholder="reps · weight · notes" value="${esc(log.set1 || '')}"></div>
          <div class="set-row"><label>SET 2</label><input type="text" data-field="set2" inputmode="text" placeholder="reps · weight · notes" value="${esc(log.set2 || '')}"></div>
          <div class="set-row"><label>SET 3</label><input type="text" data-field="set3" inputmode="text" placeholder="reps · weight · notes" value="${esc(log.set3 || '')}"></div>
          <label class="notes-label">NOTES / HOW IT FELT</label>
          <textarea class="notes-input" data-field="notes" placeholder="">${esc(log.notes || '')}</textarea>
        </div>
      ` : ''}
    `;

    // Edit button
    card.querySelector('.ex-edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      renderEditMode();
    });

    if (showLog) {
      const expandBtn = card.querySelector('.expand-btn');
      const completeBtn = card.querySelector('.complete');

      expandBtn.addEventListener('click', () => card.classList.toggle('expanded'));

      completeBtn.addEventListener('click', () => {
        const cur = STORAGE.getLog(STATE.selectedWeek, STATE.selectedDay, ex.id) || {};
        cur.completed = !cur.completed;
        STORAGE.setLog(STATE.selectedWeek, STATE.selectedDay, ex.id, cur);
        renderWorkout();
      });

      card.querySelectorAll('input[data-field], textarea[data-field]').forEach(input => {
        input.addEventListener('input', (e) => {
          const cur = STORAGE.getLog(STATE.selectedWeek, STATE.selectedDay, ex.id) || {};
          cur[e.target.dataset.field] = e.target.value;
          STORAGE.setLog(STATE.selectedWeek, STATE.selectedDay, ex.id, cur);
        });
      });

      if (log.set1 || log.set2 || log.set3 || log.notes) {
        card.classList.add('expanded');
      }
    }
  };

  const renderEditMode = () => {
    card.classList.add('editing');
    const r = ex.reps || ['','','',''];
    card.innerHTML = `
      <div class="ex-edit-form">
        <div class="edit-title">Edit Exercise</div>
        <div class="edit-row"><label>NAME</label><input type="text" data-edit="name" value="${esc(ex.name)}"></div>
        <div class="edit-row"><label>EQUIPMENT</label><input type="text" data-edit="equip" value="${esc(ex.equip || '')}"></div>
        <div class="edit-row-group">
          <div class="edit-row-group-label">SETS × REPS BY PHASE</div>
          <div class="edit-row tight"><label>Wk 1–2</label><input type="text" data-edit="rep0" value="${esc(r[0] || '')}"></div>
          <div class="edit-row tight"><label>Wk 3–4</label><input type="text" data-edit="rep1" value="${esc(r[1] || '')}"></div>
          <div class="edit-row tight"><label>Wk 5–6</label><input type="text" data-edit="rep2" value="${esc(r[2] || '')}"></div>
          <div class="edit-row tight"><label>Wk 7–8</label><input type="text" data-edit="rep3" value="${esc(r[3] || '')}"></div>
        </div>
        <div class="edit-row col"><label>COACHING CUE</label><textarea data-edit="cue" rows="4">${esc(ex.cue || '')}</textarea></div>
        <div class="edit-actions">
          <button class="edit-btn save">Save</button>
          <button class="edit-btn cancel">Cancel</button>
          <button class="edit-btn delete">Delete</button>
        </div>
      </div>
    `;

    card.querySelector('.save').addEventListener('click', () => {
      const get = sel => card.querySelector(`[data-edit="${sel}"]`).value.trim();
      const newName = get('name');
      if (!newName) { alert('Name is required.'); return; }
      // Find the exercise in DAYS and mutate it
      const found = findExerciseInDays(ex.id);
      if (!found) return;
      found.ex.name = newName;
      found.ex.equip = get('equip');
      found.ex.reps = [get('rep0'), get('rep1'), get('rep2'), get('rep3')];
      found.ex.cue = get('cue');
      saveProgramAndRerender();
    });

    card.querySelector('.cancel').addEventListener('click', () => {
      renderViewMode();
    });

    card.querySelector('.delete').addEventListener('click', () => {
      if (!confirm(`Delete "${ex.name}"? This removes it from this day permanently (you can reset to defaults in Info).`)) return;
      const found = findExerciseInDays(ex.id);
      if (!found) return;
      found.section.exercises.splice(found.idx, 1);
      saveProgramAndRerender();
    });
  };

  renderViewMode();
  return card;
}

// Find an exercise by id across the currently selected day's sections
function findExerciseInDays(exId) {
  const day = DAYS[STATE.selectedDay];
  if (!day) return null;
  for (const section of day.sections) {
    const idx = section.exercises.findIndex(e => e.id === exId);
    if (idx !== -1) return { section, ex: section.exercises[idx], idx };
  }
  return null;
}

function renderProgress() {
  const v = document.getElementById('view-progress');
  v.innerHTML = `
    <div class="progress-view">
      <h1 class="display">Progress</h1>
      <div class="sub">Log your best set each week. Watch the numbers climb.</div>
      ${PROGRESS_GROUPS.map(group => `
        <div class="progress-group">
          <div class="progress-group-title">── ${group.title} ──</div>
          ${group.items.map(item => `
            <div class="progress-exercise">
              <div class="pe-name">${item.name}</div>
              <div class="pe-goal">Goal Wk 8: ${item.goal} · ${item.metric}</div>
              <div class="week-grid">
                ${[1,2,3,4].map(wk => `
                  <div class="week-cell ${wk === STATE.todayWeek ? 'current' : ''}">
                    <label>WK ${wk}</label>
                    <input type="text" data-prog="${item.id}" data-wk="${wk}" value="${STORAGE.getProgress(item.id, wk)}" inputmode="text">
                  </div>
                `).join('')}
              </div>
              <div class="week-grid" style="margin-top: 6px;">
                ${[5,6,7,8].map(wk => `
                  <div class="week-cell ${wk === STATE.todayWeek ? 'current' : ''}">
                    <label>WK ${wk}</label>
                    <input type="text" data-prog="${item.id}" data-wk="${wk}" value="${STORAGE.getProgress(item.id, wk)}" inputmode="text">
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;
  v.querySelectorAll('input[data-prog]').forEach(input => {
    input.addEventListener('input', (e) => {
      STORAGE.setProgress(e.target.dataset.prog, parseInt(e.target.dataset.wk), e.target.value);
    });
  });
}

function renderInfo() {
  const v = document.getElementById('view-info');
  v.innerHTML = `
    <div class="info-view">
      <h1 class="display">Info</h1>

      <div class="info-block">
        <h2>Equipment</h2>
        <div class="info-item row"><div class="ii-label">Kettlebell</div><div class="ii-body">32 lbs — primary strength tool</div></div>
        <div class="info-item row"><div class="ii-label">TRX</div><div class="ii-body">Suspension trainer — rows, push-ups, squats, core</div></div>
        <div class="info-item row"><div class="ii-label">ANCORE</div><div class="ii-body">Portable cable trainer (1 unit, up to 55 lbs). True 1:1 resistance via plates in 2.5/5/10 lb increments. Mounts to your squat rack — slide up/down for angle changes.</div></div>
        <div class="info-item row"><div class="ii-label">Bands</div><div class="ii-body">Glute work, warm-up, assistance, Day C banded squats</div></div>
        <div class="info-item row"><div class="ii-label">Slam Ball</div><div class="ii-body">TRX slam ball — slams, twists, weighted core work</div></div>
        <div class="info-item row"><div class="ii-label">Weighted Vests</div><div class="ii-body">Progressive overload — added in Weeks 5–8</div></div>
        <div class="info-item row"><div class="ii-label">Stair Stepper</div><div class="ii-body">Mini stepper — warm-up + active rest</div></div>
        <div class="info-item row"><div class="ii-label">Jump Rope</div><div class="ii-body">Ropeless — warm-up + conditioning intervals</div></div>
      </div>

      <div class="info-block">
        <h2>Phase Structure</h2>
        <div class="info-item"><div class="ii-label">Phase 1 — Wk 1–4</div><div class="ii-body">Foundation. Learn movements, build work capacity, no vest. Form over load.</div></div>
        <div class="info-item"><div class="ii-label">Phase 2 — Wk 5–8</div><div class="ii-body">Progressive overload. Add weighted vest, increase reps, increase band resistance.</div></div>
      </div>

      <div class="info-block">
        <h2>Progression Rules</h2>
        <div class="info-item"><div class="ii-label">Rep Goal System</div><div class="ii-body">When you hit the TOP of the rep range for ALL sets → increase difficulty next session.</div></div>
        <div class="info-item"><div class="ii-label">KB Progression</div><div class="ii-body">More reps → more sets → add weighted vest → faster tempo.</div></div>
        <div class="info-item"><div class="ii-label">ANCORE Progression</div><div class="ii-body">Add resistance plates in 2.5 / 5 / 10 lb increments — exactly like a barbell. When you hit the top of the rep range across all sets, add one plate next session. Log actual weight in your set notes.</div></div>
        <div class="info-item"><div class="ii-label">Band Progression</div><div class="ii-body">Increase band resistance or shorten anchor point for more tension.</div></div>
        <div class="info-item"><div class="ii-label">TRX Progression</div><div class="ii-body">Adjust body angle — more horizontal = harder.</div></div>
        <div class="info-item"><div class="ii-label">If It Feels Easy</div><div class="ii-body">Good. Add 1 rep per set next session. Slow and steady.</div></div>
        <div class="info-item"><div class="ii-label">If You Can't Finish</div><div class="ii-body">Drop reps or sets. This is YOUR program, not a test.</div></div>
      </div>

      <div class="info-block">
        <h2>Synergy with Protocol</h2>
        <div class="info-item"><div class="ii-label">Retatrutide</div><div class="ii-body">Reduces appetite — ensure adequate protein (100g+/day) around workouts.</div></div>
        <div class="info-item"><div class="ii-label">KLOW Blend</div><div class="ii-body">BPC-157 + TB-500 accelerate recovery — train with confidence.</div></div>
        <div class="info-item"><div class="ii-label">MOTS-c</div><div class="ii-body">Amplifies training adaptations — expect energy improvement by Week 5–6.</div></div>
        <div class="info-item"><div class="ii-label">Daily Walking</div><div class="ii-body">Non-negotiable on rest days (Mon/Wed/Fri/Sun) — 20–30 min minimum.</div></div>
      </div>

      <div class="info-block">
        <h2>Data</h2>
        <div class="info-item"><div class="ii-body">All logged sets, session notes, and program edits are stored on this device only. They'll persist as long as you don't clear your browser data. Add this page to your home screen to use it like an app.</div></div>
        <button class="reset-btn" id="resetProgramBtn">Reset Program to Defaults</button>
        <div class="info-item" style="margin-top: 6px;"><div class="ii-body" style="font-size: 12px;">Reset wipes your exercise edits, additions, and deletions — but keeps your set logs, session notes, and progress data.</div></div>
      </div>
    </div>
  `;

  document.getElementById('resetProgramBtn').addEventListener('click', () => {
    if (!confirm('Reset all exercise edits, additions, and deletions back to the original program? Your set logs and progress data will be kept.')) return;
    STORAGE.resetProgram();
    DAYS = JSON.parse(JSON.stringify(DEFAULT_DAYS));
    renderWorkout();
    setView('workout');
  });
}

function setView(view) {
  STATE.view = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${view}`).classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.view === view));
  // Topbar only shows on workout view
  document.querySelector('.topbar').style.display = view === 'workout' ? 'block' : 'none';
  if (view === 'progress') renderProgress();
  if (view === 'info') renderInfo();
  window.scrollTo(0, 0);
}

function selectDay(dayKey) {
  STATE.selectedDay = dayKey;
  renderTopbar();
  renderWorkout();
}

// ============================================================
// INIT
// ============================================================
function init() {
  const now = new Date();
  STATE.todayWeek = getCurrentWeek(now);
  STATE.todayKey = getTodayDayKey(now);

  // Determine default selected week + day
  if (STATE.todayWeek === 0) {
    STATE.selectedWeek = 1;
    STATE.selectedDay = 'B';
  } else if (STATE.todayWeek === 9) {
    STATE.selectedWeek = 8;
    STATE.selectedDay = 'A';
  } else {
    STATE.selectedWeek = STATE.todayWeek;
    if (STATE.todayKey) {
      STATE.selectedDay = STATE.todayKey;
    } else {
      // Rest day — show next workout
      const next = getNextWorkout(now);
      STATE.selectedDay = next.key;
      // If the next workout is in a new week, advance
      const nextWeek = getCurrentWeek(next.date);
      if (nextWeek > STATE.todayWeek && nextWeek <= 8) STATE.selectedWeek = nextWeek;
    }
  }

  // Event listeners
  document.getElementById('dayTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.day-tab');
    if (tab) selectDay(tab.dataset.day);
  });
  document.getElementById('bottomNav').addEventListener('click', (e) => {
    const tab = e.target.closest('.nav-tab');
    if (tab) setView(tab.dataset.view);
  });

  renderTopbar();
  renderWorkout();
}

document.addEventListener('DOMContentLoaded', init);
