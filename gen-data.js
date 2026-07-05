const fs = require("fs");

const maleFirst = ["محمد","أحمد","عبدالله","خالد","فهد","سعد","عبدالعزيز","سلطان","ناصر","فيصل","تركي","بندر","ماجد","سعود","عمر","يوسف","إبراهيم","علي","حسن","طارق","عبدالرحمن","بدر","نواف","مشعل","زياد","يزيد","راكان","وليد","عادل","سامي"];
const femaleFirst = ["نورة","سارة","ريم","هند","لمياء","عائشة","فاطمة","منيرة","الجوهرة","دانة","رنا","شهد","أمل","لطيفة","مها","نوف","جواهر","عبير","هيا","رهف","العنود","غادة","وعد","سلمى","حصة","مريم","أروى","ديمة","نجلاء","روان"];
const family = ["العتيبي","القحطاني","الغامدي","الشهري","الدوسري","الحربي","المطيري","الزهراني","السبيعي","البقمي","الشمري","العنزي","الرشيدي","الخالدي","العمري","السلمي","الجهني","البلوي","المالكي","الحارثي","الشثري","القرني","العسيري","الدعجاني","السهلي","الزيد","الفهيد","اليامي","الشريف","الغنام"];

const specialties = ["Dermatology","Orthopedics","Cardiology","Dentistry","Pulmonary","Internal Medicine","Pediatrics","Endocrinology","General Surgery","OB/GYN"];
const subspecBySpec = {
  "Dermatology": ["Cosmetic","Pediatric derm","Dermatopathology"],
  "Orthopedics": ["Spine","Sports","Joint replacement"],
  "Cardiology": ["Interventional","Electrophysiology","Heart failure"],
  "Dentistry": ["Orthodontics","Endodontics","Prosthodontics"],
  "Pulmonary": ["Sleep medicine","Interventional pulm","Critical care"],
  "Internal Medicine": ["Hospitalist","Geriatrics","Rheumatology"],
  "Pediatrics": ["Neonatology","Pediatric cardiology","General peds"],
  "Endocrinology": ["Diabetes","Thyroid","Reproductive endo"],
  "General Surgery": ["Laparoscopic","Bariatric","Colorectal"],
  "OB/GYN": ["Maternal-fetal","Gynae-oncology","Fertility"],
};

const cities = ["Jeddah","Riyadh","Dammam","Mecca","Medina","Khobar","Abha","Tabuk","Buraidah","Khamis Mushait"];
const mohCenters = ["King Fahd Hospital","King Faisal Hospital","Prince Sultan Medical City","Jeddah Central Hospital","King Abdulaziz Medical City","Maternity and Children Hospital"];
const privateCenters = ["Dr. Sulaiman Al-Habib","Al Hammadi Hospital","Saudi German Hospital","Tadawi Clinics","Dallah Hospital","Kingdom Hospital"];
const retailPharmacies = ["AlNahdi","AlDawa","UPC"];
const companies = ["Pfizer","Novartis","GSK","Sanofi","AstraZeneca","Roche","Tabuk Pharmaceuticals","SPIMACO","Jamjoom Pharma","Hikma"];
const products = ["Cardiomax 10mg","Dermacool Gel","Pulmoease Inhaler","Glucobalance 500mg","Osteofix 70mg","Pedialyte Plus","Thyrocare 50mcg","Surgiclean Solution","Gynecare 200mg","Internomed XR"];

let seed = 7;
function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
const pick = (a) => a[Math.floor(rnd() * a.length)];
const pickN = (a, n) => { const c=[...a], out=[]; for(let i=0;i<n && c.length;i++) out.push(c.splice(Math.floor(rnd()*c.length),1)[0]); return out; };

function makeName() {
  const isMale = rnd() > 0.45;
  const first = isMale ? pick(maleFirst) : pick(femaleFirst);
  return { name: `${first} ${pick(family)}`, gender: isMale ? "Male" : "Female" };
}
function rating() { return Math.round((3.8 + rnd() * 1.2) * 10) / 10; }

// default weekly availability template: days (0=Sun..6=Sat) with a window
function availabilityFor(id) {
  const dayPool = [0,1,2,3,6]; // Sun,Mon,Tue,Wed,Sat
  const days = pickN(dayPool, 2 + Math.floor(rnd()*2)); // 2-3 days
  const startH = 9 + Math.floor(rnd()*2);   // 9 or 10
  const endH = 14 + Math.floor(rnd()*3);    // 14-16
  return { slotMinutes: 15, fixedWeekly: true, days: days.sort(), startH, endH };
}

// IMPORTANT — id stability: src/lib/seed.js FEATURED_IDS hardcodes phy_1,
// pha_101, pur_131, rep_141 as the 5 "featured" demo/login personas (and the
// only valid email+password logins). Those numbers depend on the *order and
// counts* below (100 physicians, then 30 pharmacists, then 10 purchasers,
// then 10 reps, off one shared counter) — adding more names/cities to the
// pools above is safe, but reordering these blocks or changing a count would
// shift the ids and break the featured-persona mapping.
let id = 1;
const physicians = [];
specialties.forEach((spec) => {
  for (let i = 0; i < 10; i++) {
    const { name, gender } = makeName();
    const city = pick(cities);
    const sector = rnd() > 0.5 ? "MOH" : "Private";
    const center = sector === "MOH" ? pick(mohCenters) : pick(privateCenters);
    const pid = `phy_${id++}`;
    physicians.push({
      id: pid, role: "Physician", name, gender, specialty: spec,
      subspecialty: pick(subspecBySpec[spec]), degree: pick(["MD","FRCP","SBFM","ABIM"]),
      city, sector, center, rating: rating(), availability: availabilityFor(pid),
    });
  }
});

const pharmacists = [];
for (let i = 0; i < 30; i++) {
  const { name, gender } = makeName();
  const retail = rnd() > 0.4;
  const city = pick(cities);
  const pid = `pha_${id++}`;
  pharmacists.push({
    id: pid, role: "Pharmacist", name, gender,
    setting: retail ? "Retail" : "Hospital",
    center: retail ? pick(retailPharmacies) : (rnd()>0.5?pick(mohCenters):pick(privateCenters)),
    sector: retail ? "Retail" : (rnd()>0.5?"MOH":"Private"),
    city, rating: rating(), availability: availabilityFor(pid),
  });
}

const purchasers = [];
for (let i = 0; i < 10; i++) {
  const { name, gender } = makeName();
  const moh = rnd() > 0.5;
  const city = pick(cities);
  const pid = `pur_${id++}`;
  purchasers.push({
    id: pid, role: "Purchaser", name, gender,
    sector: moh ? "MOH" : "Private",
    center: moh ? pick(mohCenters) : pick(privateCenters),
    city, rating: rating(), availability: availabilityFor(pid),
  });
}

const reps = [];
for (let i = 0; i < 10; i++) {
  const { name, gender } = makeName();
  const pid = `rep_${id++}`;
  reps.push({
    id: pid, role: pick(["MR","KAM","PS","PM"]), name, gender,
    company: pick(companies), product: pick(products),
    territory: pick(cities), specialties: pickN(specialties, 2),
  });
}

const data = { specialties, cities, mohCenters, privateCenters, retailPharmacies, companies, physicians, pharmacists, purchasers, reps };
fs.writeFileSync(__dirname + "/src/data/directory.json", JSON.stringify(data, null, 2));
console.log(`physicians ${physicians.length}, pharmacists ${pharmacists.length}, purchasers ${purchasers.length}, reps ${reps.length}`);
