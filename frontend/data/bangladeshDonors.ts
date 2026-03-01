// All 64 Districts of Bangladesh grouped by Division
export const BANGLADESH_DIVISIONS: Record<string, string[]> = {
  'Barishal': ['Barguna', 'Barishal', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur'],
  'Chattogram': ['Bandarban', 'Brahmanbaria', 'Chandpur', 'Chattogram', 'Comilla', "Cox's Bazar", 'Feni', 'Khagrachari', 'Lakshmipur', 'Noakhali', 'Rangamati'],
  'Dhaka': ['Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Kishoreganj', 'Madaripur', 'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi', 'Rajbari', 'Shariatpur', 'Tangail'],
  'Khulna': ['Bagerhat', 'Chuadanga', 'Jashore', 'Jhenaidah', 'Khulna', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira'],
  'Mymensingh': ['Jamalpur', 'Mymensingh', 'Netrokona', 'Sherpur'],
  'Rajshahi': ['Bogura', 'Chapai Nawabganj', 'Joypurhat', 'Naogaon', 'Natore', 'Pabna', 'Rajshahi', 'Sirajganj'],
  'Rangpur': ['Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Rangpur', 'Thakurgaon'],
  'Sylhet': ['Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet'],
};

// Flat sorted list of all 64 districts
export const ALL_DISTRICTS: string[] = Object.values(BANGLADESH_DIVISIONS).flat().sort();

// Blood groups
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export interface DemoDonor {
  id: string;
  name: string;
  bloodGroup: string;
  location: string;
  district: string;
  phone: string;
  verified: boolean;
  lastDonation?: string;
}

// Comprehensive donor data for all 64 districts
export const DISTRICT_DONORS: DemoDonor[] = [
  // ========== BARISHAL DIVISION ==========
  // Barguna
  { id: 'bd-bar-1', name: 'Rahim Uddin', bloodGroup: 'A+', location: 'Barguna Sadar, Barguna', district: 'Barguna', phone: '+8801711000101', verified: true },
  { id: 'bd-bar-2', name: 'Fatema Begum', bloodGroup: 'B+', location: 'Amtali, Barguna', district: 'Barguna', phone: '+8801711000102', verified: true },
  { id: 'bd-bar-3', name: 'Sohel Rana', bloodGroup: 'O+', location: 'Betagi, Barguna', district: 'Barguna', phone: '+8801711000103', verified: false },
  { id: 'bd-bar-4', name: 'Nasrin Akter', bloodGroup: 'AB+', location: 'Patharghata, Barguna', district: 'Barguna', phone: '+8801711000104', verified: true },
  { id: 'bd-bar-5', name: 'Kamal Hossain', bloodGroup: 'O-', location: 'Bamna, Barguna', district: 'Barguna', phone: '+8801711000105', verified: false },
  // Barishal
  { id: 'bd-brs-1', name: 'Tanvir Ahmed', bloodGroup: 'A+', location: 'Barishal Sadar, Barishal', district: 'Barishal', phone: '+8801711000201', verified: true },
  { id: 'bd-brs-2', name: 'Sumiya Khatun', bloodGroup: 'B-', location: 'Bakerganj, Barishal', district: 'Barishal', phone: '+8801711000202', verified: true },
  { id: 'bd-brs-3', name: 'Rafiq Islam', bloodGroup: 'O+', location: 'Banaripara, Barishal', district: 'Barishal', phone: '+8801711000203', verified: true },
  { id: 'bd-brs-4', name: 'Dilara Begum', bloodGroup: 'AB-', location: 'Gournadi, Barishal', district: 'Barishal', phone: '+8801711000204', verified: false },
  { id: 'bd-brs-5', name: 'Zahid Hasan', bloodGroup: 'A-', location: 'Muladi, Barishal', district: 'Barishal', phone: '+8801711000205', verified: true },
  // Bhola
  { id: 'bd-bhl-1', name: 'Masud Karim', bloodGroup: 'B+', location: 'Bhola Sadar, Bhola', district: 'Bhola', phone: '+8801711000301', verified: true },
  { id: 'bd-bhl-2', name: 'Ayesha Siddika', bloodGroup: 'O+', location: 'Daulatkhan, Bhola', district: 'Bhola', phone: '+8801711000302', verified: false },
  { id: 'bd-bhl-3', name: 'Habibur Rahman', bloodGroup: 'A+', location: 'Borhanuddin, Bhola', district: 'Bhola', phone: '+8801711000303', verified: true },
  { id: 'bd-bhl-4', name: 'Ruma Akter', bloodGroup: 'AB+', location: 'Lalmohan, Bhola', district: 'Bhola', phone: '+8801711000304', verified: true },
  { id: 'bd-bhl-5', name: 'Shahin Miah', bloodGroup: 'B-', location: 'Char Fasson, Bhola', district: 'Bhola', phone: '+8801711000305', verified: false },
  // Jhalokati
  { id: 'bd-jhl-1', name: 'Mizanur Rahman', bloodGroup: 'O+', location: 'Jhalokati Sadar, Jhalokati', district: 'Jhalokati', phone: '+8801711000401', verified: true },
  { id: 'bd-jhl-2', name: 'Sharmin Sultana', bloodGroup: 'A+', location: 'Nalchity, Jhalokati', district: 'Jhalokati', phone: '+8801711000402', verified: true },
  { id: 'bd-jhl-3', name: 'Imran Hossain', bloodGroup: 'B+', location: 'Rajapur, Jhalokati', district: 'Jhalokati', phone: '+8801711000403', verified: false },
  { id: 'bd-jhl-4', name: 'Taslima Nahar', bloodGroup: 'O-', location: 'Kathalia, Jhalokati', district: 'Jhalokati', phone: '+8801711000404', verified: true },
  // Patuakhali
  { id: 'bd-ptk-1', name: 'Firoz Ahmed', bloodGroup: 'A+', location: 'Patuakhali Sadar, Patuakhali', district: 'Patuakhali', phone: '+8801711000501', verified: true },
  { id: 'bd-ptk-2', name: 'Salma Begum', bloodGroup: 'B+', location: 'Galachipa, Patuakhali', district: 'Patuakhali', phone: '+8801711000502', verified: true },
  { id: 'bd-ptk-3', name: 'Nurul Islam', bloodGroup: 'O+', location: 'Kalapara, Patuakhali', district: 'Patuakhali', phone: '+8801711000503', verified: false },
  { id: 'bd-ptk-4', name: 'Rehana Parveen', bloodGroup: 'AB+', location: 'Dashmina, Patuakhali', district: 'Patuakhali', phone: '+8801711000504', verified: true },
  { id: 'bd-ptk-5', name: 'Jahangir Alam', bloodGroup: 'A-', location: 'Dumki, Patuakhali', district: 'Patuakhali', phone: '+8801711000505', verified: true },
  // Pirojpur
  { id: 'bd-prj-1', name: 'Golam Mostafa', bloodGroup: 'B+', location: 'Pirojpur Sadar, Pirojpur', district: 'Pirojpur', phone: '+8801711000601', verified: true },
  { id: 'bd-prj-2', name: 'Israt Jahan', bloodGroup: 'O+', location: 'Bhandaria, Pirojpur', district: 'Pirojpur', phone: '+8801711000602', verified: true },
  { id: 'bd-prj-3', name: 'Selim Reza', bloodGroup: 'A+', location: 'Mathbaria, Pirojpur', district: 'Pirojpur', phone: '+8801711000603', verified: false },
  { id: 'bd-prj-4', name: 'Nipa Akter', bloodGroup: 'AB-', location: 'Nazirpur, Pirojpur', district: 'Pirojpur', phone: '+8801711000604', verified: true },

  // ========== CHATTOGRAM DIVISION ==========
  // Bandarban
  { id: 'bd-bdb-1', name: 'Aung Swe Marma', bloodGroup: 'O+', location: 'Bandarban Sadar, Bandarban', district: 'Bandarban', phone: '+8801711001001', verified: true },
  { id: 'bd-bdb-2', name: 'Ching Mong Chak', bloodGroup: 'A+', location: 'Ruma, Bandarban', district: 'Bandarban', phone: '+8801711001002', verified: true },
  { id: 'bd-bdb-3', name: 'Prodip Chakma', bloodGroup: 'B+', location: 'Thanchi, Bandarban', district: 'Bandarban', phone: '+8801711001003', verified: false },
  { id: 'bd-bdb-4', name: 'Mong Sanu Marma', bloodGroup: 'AB+', location: 'Rowangchari, Bandarban', district: 'Bandarban', phone: '+8801711001004', verified: true },
  // Brahmanbaria
  { id: 'bd-brb-1', name: 'Asif Iqbal', bloodGroup: 'A+', location: 'Brahmanbaria Sadar, Brahmanbaria', district: 'Brahmanbaria', phone: '+8801711001101', verified: true },
  { id: 'bd-brb-2', name: 'Farzana Yasmin', bloodGroup: 'B+', location: 'Ashuganj, Brahmanbaria', district: 'Brahmanbaria', phone: '+8801711001102', verified: true },
  { id: 'bd-brb-3', name: 'Sabbir Hossain', bloodGroup: 'O+', location: 'Nabinagar, Brahmanbaria', district: 'Brahmanbaria', phone: '+8801711001103', verified: false },
  { id: 'bd-brb-4', name: 'Tamanna Haque', bloodGroup: 'O-', location: 'Sarail, Brahmanbaria', district: 'Brahmanbaria', phone: '+8801711001104', verified: true },
  { id: 'bd-brb-5', name: 'Rubel Miah', bloodGroup: 'AB+', location: 'Kasba, Brahmanbaria', district: 'Brahmanbaria', phone: '+8801711001105', verified: true },
  // Chandpur
  { id: 'bd-chd-1', name: 'Shafiqul Islam', bloodGroup: 'B+', location: 'Chandpur Sadar, Chandpur', district: 'Chandpur', phone: '+8801711001201', verified: true },
  { id: 'bd-chd-2', name: 'Lipi Begum', bloodGroup: 'A+', location: 'Hajiganj, Chandpur', district: 'Chandpur', phone: '+8801711001202', verified: true },
  { id: 'bd-chd-3', name: 'Monir Hossain', bloodGroup: 'O+', location: 'Matlab North, Chandpur', district: 'Chandpur', phone: '+8801711001203', verified: false },
  { id: 'bd-chd-4', name: 'Sadia Islam', bloodGroup: 'AB-', location: 'Faridganj, Chandpur', district: 'Chandpur', phone: '+8801711001204', verified: true },
  // Chattogram
  { id: 'bd-ctg-1', name: 'Murad Hossain', bloodGroup: 'A+', location: 'Agrabad, Chattogram', district: 'Chattogram', phone: '+8801711001301', verified: true },
  { id: 'bd-ctg-2', name: 'Sumi Akter', bloodGroup: 'B+', location: 'Halishahar, Chattogram', district: 'Chattogram', phone: '+8801711001302', verified: true },
  { id: 'bd-ctg-3', name: 'Shakil Ahmed', bloodGroup: 'O+', location: 'Pahartali, Chattogram', district: 'Chattogram', phone: '+8801711001303', verified: true },
  { id: 'bd-ctg-4', name: 'Rima Sultana', bloodGroup: 'AB+', location: 'Nasirabad, Chattogram', district: 'Chattogram', phone: '+8801711001304', verified: false },
  { id: 'bd-ctg-5', name: 'Faisal Khan', bloodGroup: 'O-', location: 'GEC Circle, Chattogram', district: 'Chattogram', phone: '+8801711001305', verified: true },
  { id: 'bd-ctg-6', name: 'Nusrat Jahan', bloodGroup: 'A-', location: 'Patenga, Chattogram', district: 'Chattogram', phone: '+8801711001306', verified: true },
  // Comilla
  { id: 'bd-com-1', name: 'Rajib Kumar', bloodGroup: 'B+', location: 'Comilla Sadar, Comilla', district: 'Comilla', phone: '+8801711001401', verified: true },
  { id: 'bd-com-2', name: 'Ankhi Akter', bloodGroup: 'A+', location: 'Daudkandi, Comilla', district: 'Comilla', phone: '+8801711001402', verified: true },
  { id: 'bd-com-3', name: 'Dulal Miah', bloodGroup: 'O+', location: 'Laksam, Comilla', district: 'Comilla', phone: '+8801711001403', verified: false },
  { id: 'bd-com-4', name: 'Hasina Begum', bloodGroup: 'AB+', location: 'Chauddagram, Comilla', district: 'Comilla', phone: '+8801711001404', verified: true },
  { id: 'bd-com-5', name: 'Sumon Das', bloodGroup: 'B-', location: 'Debidwar, Comilla', district: 'Comilla', phone: '+8801711001405', verified: true },
  // Cox's Bazar
  { id: 'bd-cxb-1', name: 'Jamal Uddin', bloodGroup: 'O+', location: "Cox's Bazar Sadar, Cox's Bazar", district: "Cox's Bazar", phone: '+8801711001501', verified: true },
  { id: 'bd-cxb-2', name: 'Shahnaz Parveen', bloodGroup: 'A+', location: "Teknaf, Cox's Bazar", district: "Cox's Bazar", phone: '+8801711001502', verified: true },
  { id: 'bd-cxb-3', name: 'Arif Hossain', bloodGroup: 'B+', location: "Ukhia, Cox's Bazar", district: "Cox's Bazar", phone: '+8801711001503', verified: false },
  { id: 'bd-cxb-4', name: 'Lima Akter', bloodGroup: 'AB+', location: "Maheshkhali, Cox's Bazar", district: "Cox's Bazar", phone: '+8801711001504', verified: true },
  { id: 'bd-cxb-5', name: 'Pervez Rahman', bloodGroup: 'O-', location: "Ramu, Cox's Bazar", district: "Cox's Bazar", phone: '+8801711001505', verified: true },
  // Feni
  { id: 'bd-fen-1', name: 'Tarek Aziz', bloodGroup: 'A+', location: 'Feni Sadar, Feni', district: 'Feni', phone: '+8801711001601', verified: true },
  { id: 'bd-fen-2', name: 'Nurjahan Begum', bloodGroup: 'B+', location: 'Daganbhuiyan, Feni', district: 'Feni', phone: '+8801711001602', verified: true },
  { id: 'bd-fen-3', name: 'Robin Chowdhury', bloodGroup: 'O+', location: 'Sonagazi, Feni', district: 'Feni', phone: '+8801711001603', verified: false },
  { id: 'bd-fen-4', name: 'Zakia Sultana', bloodGroup: 'AB-', location: 'Parshuram, Feni', district: 'Feni', phone: '+8801711001604', verified: true },
  // Khagrachari
  { id: 'bd-khg-1', name: 'Uttam Chakma', bloodGroup: 'B+', location: 'Khagrachari Sadar, Khagrachari', district: 'Khagrachari', phone: '+8801711001701', verified: true },
  { id: 'bd-khg-2', name: 'Prue Shin Marma', bloodGroup: 'A+', location: 'Dighinala, Khagrachari', district: 'Khagrachari', phone: '+8801711001702', verified: true },
  { id: 'bd-khg-3', name: 'Bimal Tripura', bloodGroup: 'O+', location: 'Ramgarh, Khagrachari', district: 'Khagrachari', phone: '+8801711001703', verified: false },
  { id: 'bd-khg-4', name: 'Jyoti Chakma', bloodGroup: 'O-', location: 'Matiranga, Khagrachari', district: 'Khagrachari', phone: '+8801711001704', verified: true },
  // Lakshmipur
  { id: 'bd-lkp-1', name: 'Nayeem Uddin', bloodGroup: 'O+', location: 'Lakshmipur Sadar, Lakshmipur', district: 'Lakshmipur', phone: '+8801711001801', verified: true },
  { id: 'bd-lkp-2', name: 'Amina Khatun', bloodGroup: 'A+', location: 'Raipur, Lakshmipur', district: 'Lakshmipur', phone: '+8801711001802', verified: true },
  { id: 'bd-lkp-3', name: 'Babul Miah', bloodGroup: 'B+', location: 'Ramgati, Lakshmipur', district: 'Lakshmipur', phone: '+8801711001803', verified: false },
  { id: 'bd-lkp-4', name: 'Parveen Akter', bloodGroup: 'AB+', location: 'Kamalnagar, Lakshmipur', district: 'Lakshmipur', phone: '+8801711001804', verified: true },
  // Noakhali
  { id: 'bd-nkl-1', name: 'Ripon Miah', bloodGroup: 'A+', location: 'Noakhali Sadar, Noakhali', district: 'Noakhali', phone: '+8801711001901', verified: true },
  { id: 'bd-nkl-2', name: 'Shirin Akter', bloodGroup: 'B+', location: 'Begumganj, Noakhali', district: 'Noakhali', phone: '+8801711001902', verified: true },
  { id: 'bd-nkl-3', name: 'Liton Chowdhury', bloodGroup: 'O+', location: 'Senbagh, Noakhali', district: 'Noakhali', phone: '+8801711001903', verified: false },
  { id: 'bd-nkl-4', name: 'Tania Sultana', bloodGroup: 'AB+', location: 'Companiganj, Noakhali', district: 'Noakhali', phone: '+8801711001904', verified: true },
  { id: 'bd-nkl-5', name: 'Omar Faruk', bloodGroup: 'O-', location: 'Hatiya, Noakhali', district: 'Noakhali', phone: '+8801711001905', verified: true },
  // Rangamati
  { id: 'bd-rgm-1', name: 'Bijoy Chakma', bloodGroup: 'B+', location: 'Rangamati Sadar, Rangamati', district: 'Rangamati', phone: '+8801711002001', verified: true },
  { id: 'bd-rgm-2', name: 'Mong Nu Marma', bloodGroup: 'A+', location: 'Kaptai, Rangamati', district: 'Rangamati', phone: '+8801711002002', verified: true },
  { id: 'bd-rgm-3', name: 'Shanti Dewan Tripura', bloodGroup: 'O+', location: 'Langadu, Rangamati', district: 'Rangamati', phone: '+8801711002003', verified: false },
  { id: 'bd-rgm-4', name: 'Ratna Chakma', bloodGroup: 'AB+', location: 'Rajasthali, Rangamati', district: 'Rangamati', phone: '+8801711002004', verified: true },

  // ========== DHAKA DIVISION ==========
  // Dhaka
  { id: 'bd-dha-1', name: 'Kamrul Hasan', bloodGroup: 'A+', location: 'Dhanmondi, Dhaka', district: 'Dhaka', phone: '+8801711002101', verified: true },
  { id: 'bd-dha-2', name: 'Nabila Karim', bloodGroup: 'B+', location: 'Gulshan, Dhaka', district: 'Dhaka', phone: '+8801711002102', verified: true },
  { id: 'bd-dha-3', name: 'Sajid Islam', bloodGroup: 'O+', location: 'Banani, Dhaka', district: 'Dhaka', phone: '+8801711002103', verified: true },
  { id: 'bd-dha-4', name: 'Rashed Khan', bloodGroup: 'AB+', location: 'Uttara, Dhaka', district: 'Dhaka', phone: '+8801711002104', verified: true },
  { id: 'bd-dha-5', name: 'Sadia Rahman', bloodGroup: 'A-', location: 'Mirpur, Dhaka', district: 'Dhaka', phone: '+8801711002105', verified: false },
  { id: 'bd-dha-6', name: 'Tanzim Ahmed', bloodGroup: 'O-', location: 'Mohammadpur, Dhaka', district: 'Dhaka', phone: '+8801711002106', verified: true },
  { id: 'bd-dha-7', name: 'Mariam Akter', bloodGroup: 'B-', location: 'Motijheel, Dhaka', district: 'Dhaka', phone: '+8801711002107', verified: true },
  { id: 'bd-dha-8', name: 'Imtiaz Hossain', bloodGroup: 'AB-', location: 'Tejgaon, Dhaka', district: 'Dhaka', phone: '+8801711002108', verified: true },
  // Faridpur
  { id: 'bd-frp-1', name: 'Shahidul Islam', bloodGroup: 'A+', location: 'Faridpur Sadar, Faridpur', district: 'Faridpur', phone: '+8801711002201', verified: true },
  { id: 'bd-frp-2', name: 'Kamrunnahar Begum', bloodGroup: 'B+', location: 'Boalmari, Faridpur', district: 'Faridpur', phone: '+8801711002202', verified: true },
  { id: 'bd-frp-3', name: 'Milon Sheikh', bloodGroup: 'O+', location: 'Madhukhali, Faridpur', district: 'Faridpur', phone: '+8801711002203', verified: false },
  { id: 'bd-frp-4', name: 'Umme Habiba', bloodGroup: 'AB+', location: 'Nagarkanda, Faridpur', district: 'Faridpur', phone: '+8801711002204', verified: true },
  // Gazipur
  { id: 'bd-gzp-1', name: 'Saiful Islam', bloodGroup: 'O+', location: 'Gazipur Sadar, Gazipur', district: 'Gazipur', phone: '+8801711002301', verified: true },
  { id: 'bd-gzp-2', name: 'Liza Begum', bloodGroup: 'A+', location: 'Tongi, Gazipur', district: 'Gazipur', phone: '+8801711002302', verified: true },
  { id: 'bd-gzp-3', name: 'Anis Mahmud', bloodGroup: 'B+', location: 'Kaliakair, Gazipur', district: 'Gazipur', phone: '+8801711002303', verified: false },
  { id: 'bd-gzp-4', name: 'Sharmin Nahar', bloodGroup: 'AB-', location: 'Kapasia, Gazipur', district: 'Gazipur', phone: '+8801711002304', verified: true },
  { id: 'bd-gzp-5', name: 'Uzzal Sarker', bloodGroup: 'O-', location: 'Sreepur, Gazipur', district: 'Gazipur', phone: '+8801711002305', verified: true },
  // Gopalganj
  { id: 'bd-gpg-1', name: 'Mostafiz Rahman', bloodGroup: 'B+', location: 'Gopalganj Sadar, Gopalganj', district: 'Gopalganj', phone: '+8801711002401', verified: true },
  { id: 'bd-gpg-2', name: 'Runa Laila', bloodGroup: 'A+', location: 'Tungipara, Gopalganj', district: 'Gopalganj', phone: '+8801711002402', verified: true },
  { id: 'bd-gpg-3', name: 'Zahir Uddin', bloodGroup: 'O+', location: 'Kotalipara, Gopalganj', district: 'Gopalganj', phone: '+8801711002403', verified: false },
  { id: 'bd-gpg-4', name: 'Fatema Tuz Zohra', bloodGroup: 'AB+', location: 'Kashiani, Gopalganj', district: 'Gopalganj', phone: '+8801711002404', verified: true },
  // Kishoreganj
  { id: 'bd-ksg-1', name: 'Nasir Uddin', bloodGroup: 'A+', location: 'Kishoreganj Sadar, Kishoreganj', district: 'Kishoreganj', phone: '+8801711002501', verified: true },
  { id: 'bd-ksg-2', name: 'Mitu Begum', bloodGroup: 'B+', location: 'Bhairab, Kishoreganj', district: 'Kishoreganj', phone: '+8801711002502', verified: true },
  { id: 'bd-ksg-3', name: 'Taher Ali', bloodGroup: 'O+', location: 'Bajitpur, Kishoreganj', district: 'Kishoreganj', phone: '+8801711002503', verified: false },
  { id: 'bd-ksg-4', name: 'Amina Sultana', bloodGroup: 'O-', location: 'Kuliarchar, Kishoreganj', district: 'Kishoreganj', phone: '+8801711002504', verified: true },
  // Madaripur
  { id: 'bd-mdp-1', name: 'Rashed Ahmed', bloodGroup: 'B+', location: 'Madaripur Sadar, Madaripur', district: 'Madaripur', phone: '+8801711002601', verified: true },
  { id: 'bd-mdp-2', name: 'Hosneara Begum', bloodGroup: 'A+', location: 'Rajoir, Madaripur', district: 'Madaripur', phone: '+8801711002602', verified: true },
  { id: 'bd-mdp-3', name: 'Abul Kalam', bloodGroup: 'O+', location: 'Kalkini, Madaripur', district: 'Madaripur', phone: '+8801711002603', verified: false },
  { id: 'bd-mdp-4', name: 'Nazneen Akter', bloodGroup: 'AB+', location: 'Shibchar, Madaripur', district: 'Madaripur', phone: '+8801711002604', verified: true },
  // Manikganj
  { id: 'bd-mnk-1', name: 'Shamim Reza', bloodGroup: 'O+', location: 'Manikganj Sadar, Manikganj', district: 'Manikganj', phone: '+8801711002701', verified: true },
  { id: 'bd-mnk-2', name: 'Jharna Begum', bloodGroup: 'A+', location: 'Singair, Manikganj', district: 'Manikganj', phone: '+8801711002702', verified: true },
  { id: 'bd-mnk-3', name: 'Kabirul Islam', bloodGroup: 'B+', location: 'Ghior, Manikganj', district: 'Manikganj', phone: '+8801711002703', verified: false },
  { id: 'bd-mnk-4', name: 'Popy Akter', bloodGroup: 'AB-', location: 'Saturia, Manikganj', district: 'Manikganj', phone: '+8801711002704', verified: true },
  // Munshiganj
  { id: 'bd-mns-1', name: 'Sumon Ahmed', bloodGroup: 'A+', location: 'Munshiganj Sadar, Munshiganj', district: 'Munshiganj', phone: '+8801711002801', verified: true },
  { id: 'bd-mns-2', name: 'Dilara Jahan', bloodGroup: 'B+', location: 'Sreenagar, Munshiganj', district: 'Munshiganj', phone: '+8801711002802', verified: true },
  { id: 'bd-mns-3', name: 'Siddique Hossain', bloodGroup: 'O+', location: 'Sirajdikhan, Munshiganj', district: 'Munshiganj', phone: '+8801711002803', verified: false },
  { id: 'bd-mns-4', name: 'Rokeya Begum', bloodGroup: 'O-', location: 'Lohajang, Munshiganj', district: 'Munshiganj', phone: '+8801711002804', verified: true },
  // Narayanganj
  { id: 'bd-nrg-1', name: 'Mamun Rashid', bloodGroup: 'B+', location: 'Narayanganj Sadar, Narayanganj', district: 'Narayanganj', phone: '+8801711002901', verified: true },
  { id: 'bd-nrg-2', name: 'Laboni Akter', bloodGroup: 'A+', location: 'Sonargaon, Narayanganj', district: 'Narayanganj', phone: '+8801711002902', verified: true },
  { id: 'bd-nrg-3', name: 'Faruque Ahmed', bloodGroup: 'O+', location: 'Rupganj, Narayanganj', district: 'Narayanganj', phone: '+8801711002903', verified: true },
  { id: 'bd-nrg-4', name: 'Kulsum Akter', bloodGroup: 'AB+', location: 'Araihazar, Narayanganj', district: 'Narayanganj', phone: '+8801711002904', verified: false },
  { id: 'bd-nrg-5', name: 'Helal Uddin', bloodGroup: 'A-', location: 'Bandar, Narayanganj', district: 'Narayanganj', phone: '+8801711002905', verified: true },
  // Narsingdi
  { id: 'bd-nrs-1', name: 'Alamgir Kabir', bloodGroup: 'O+', location: 'Narsingdi Sadar, Narsingdi', district: 'Narsingdi', phone: '+8801711003001', verified: true },
  { id: 'bd-nrs-2', name: 'Beauty Akter', bloodGroup: 'A+', location: 'Palash, Narsingdi', district: 'Narsingdi', phone: '+8801711003002', verified: true },
  { id: 'bd-nrs-3', name: 'Shamsul Haque', bloodGroup: 'B+', location: 'Shibpur, Narsingdi', district: 'Narsingdi', phone: '+8801711003003', verified: false },
  { id: 'bd-nrs-4', name: 'Mahfuza Begum', bloodGroup: 'AB+', location: 'Belabo, Narsingdi', district: 'Narsingdi', phone: '+8801711003004', verified: true },
  // Rajbari
  { id: 'bd-rjb-1', name: 'Khorshed Alam', bloodGroup: 'A+', location: 'Rajbari Sadar, Rajbari', district: 'Rajbari', phone: '+8801711003101', verified: true },
  { id: 'bd-rjb-2', name: 'Sufia Khatun', bloodGroup: 'B+', location: 'Goalanda, Rajbari', district: 'Rajbari', phone: '+8801711003102', verified: true },
  { id: 'bd-rjb-3', name: 'Kashem Molla', bloodGroup: 'O+', location: 'Pangsha, Rajbari', district: 'Rajbari', phone: '+8801711003103', verified: false },
  { id: 'bd-rjb-4', name: 'Nargis Parveen', bloodGroup: 'O-', location: 'Kalukhali, Rajbari', district: 'Rajbari', phone: '+8801711003104', verified: true },
  // Shariatpur
  { id: 'bd-shp-1', name: 'Jashim Uddin', bloodGroup: 'B+', location: 'Shariatpur Sadar, Shariatpur', district: 'Shariatpur', phone: '+8801711003201', verified: true },
  { id: 'bd-shp-2', name: 'Shirina Akter', bloodGroup: 'A+', location: 'Naria, Shariatpur', district: 'Shariatpur', phone: '+8801711003202', verified: true },
  { id: 'bd-shp-3', name: 'Mozammel Haque', bloodGroup: 'O+', location: 'Gosairhat, Shariatpur', district: 'Shariatpur', phone: '+8801711003203', verified: false },
  { id: 'bd-shp-4', name: 'Nazma Begum', bloodGroup: 'AB+', location: 'Zanjira, Shariatpur', district: 'Shariatpur', phone: '+8801711003204', verified: true },
  // Tangail
  { id: 'bd-tng-1', name: 'Rafiqul Islam', bloodGroup: 'O+', location: 'Tangail Sadar, Tangail', district: 'Tangail', phone: '+8801711003301', verified: true },
  { id: 'bd-tng-2', name: 'Moushumi Begum', bloodGroup: 'A+', location: 'Mirzapur, Tangail', district: 'Tangail', phone: '+8801711003302', verified: true },
  { id: 'bd-tng-3', name: 'Lokman Hakim', bloodGroup: 'B+', location: 'Gopalpur, Tangail', district: 'Tangail', phone: '+8801711003303', verified: false },
  { id: 'bd-tng-4', name: 'Farida Yasmin', bloodGroup: 'AB-', location: 'Madhupur, Tangail', district: 'Tangail', phone: '+8801711003304', verified: true },
  { id: 'bd-tng-5', name: 'Azizul Haque', bloodGroup: 'A-', location: 'Sakhipur, Tangail', district: 'Tangail', phone: '+8801711003305', verified: true },

  // ========== KHULNA DIVISION ==========
  // Bagerhat
  { id: 'bd-bgh-1', name: 'Shahjahan Ali', bloodGroup: 'A+', location: 'Bagerhat Sadar, Bagerhat', district: 'Bagerhat', phone: '+8801711003401', verified: true },
  { id: 'bd-bgh-2', name: 'Jeba Nasrin', bloodGroup: 'B+', location: 'Mongla, Bagerhat', district: 'Bagerhat', phone: '+8801711003402', verified: true },
  { id: 'bd-bgh-3', name: 'Mizan Sarker', bloodGroup: 'O+', location: 'Rampal, Bagerhat', district: 'Bagerhat', phone: '+8801711003403', verified: false },
  { id: 'bd-bgh-4', name: 'Moni Akter', bloodGroup: 'AB+', location: 'Morrelganj, Bagerhat', district: 'Bagerhat', phone: '+8801711003404', verified: true },
  // Chuadanga
  { id: 'bd-chg-1', name: 'Abdur Rahim', bloodGroup: 'B+', location: 'Chuadanga Sadar, Chuadanga', district: 'Chuadanga', phone: '+8801711003501', verified: true },
  { id: 'bd-chg-2', name: 'Tanzila Akter', bloodGroup: 'A+', location: 'Alamdanga, Chuadanga', district: 'Chuadanga', phone: '+8801711003502', verified: true },
  { id: 'bd-chg-3', name: 'Billal Hossain', bloodGroup: 'O+', location: 'Damurhuda, Chuadanga', district: 'Chuadanga', phone: '+8801711003503', verified: false },
  { id: 'bd-chg-4', name: 'Monika Begum', bloodGroup: 'O-', location: 'Jibannagar, Chuadanga', district: 'Chuadanga', phone: '+8801711003504', verified: true },
  // Jashore
  { id: 'bd-jsh-1', name: 'Masud Rana', bloodGroup: 'O+', location: 'Jashore Sadar, Jashore', district: 'Jashore', phone: '+8801711003601', verified: true },
  { id: 'bd-jsh-2', name: 'Farhana Yesmin', bloodGroup: 'A+', location: 'Benapole, Jashore', district: 'Jashore', phone: '+8801711003602', verified: true },
  { id: 'bd-jsh-3', name: 'Anisur Rahman', bloodGroup: 'B+', location: 'Abhaynagar, Jashore', district: 'Jashore', phone: '+8801711003603', verified: false },
  { id: 'bd-jsh-4', name: 'Rubina Khatun', bloodGroup: 'AB+', location: 'Chaugachha, Jashore', district: 'Jashore', phone: '+8801711003604', verified: true },
  { id: 'bd-jsh-5', name: 'Tapan Kumar', bloodGroup: 'A-', location: 'Jhikargachha, Jashore', district: 'Jashore', phone: '+8801711003605', verified: true },
  // Jhenaidah
  { id: 'bd-jhd-1', name: 'Ashraf Ali', bloodGroup: 'A+', location: 'Jhenaidah Sadar, Jhenaidah', district: 'Jhenaidah', phone: '+8801711003701', verified: true },
  { id: 'bd-jhd-2', name: 'Sultana Razia', bloodGroup: 'B+', location: 'Maheshpur, Jhenaidah', district: 'Jhenaidah', phone: '+8801711003702', verified: true },
  { id: 'bd-jhd-3', name: 'Gafur Miah', bloodGroup: 'O+', location: 'Sailkupa, Jhenaidah', district: 'Jhenaidah', phone: '+8801711003703', verified: false },
  { id: 'bd-jhd-4', name: 'Meherun Nessa', bloodGroup: 'AB-', location: 'Kotchandpur, Jhenaidah', district: 'Jhenaidah', phone: '+8801711003704', verified: true },
  // Khulna
  { id: 'bd-khl-1', name: 'Morshed Ali', bloodGroup: 'B+', location: 'Khulna Sadar, Khulna', district: 'Khulna', phone: '+8801711003801', verified: true },
  { id: 'bd-khl-2', name: 'Nilufa Begum', bloodGroup: 'A+', location: 'Daulatpur, Khulna', district: 'Khulna', phone: '+8801711003802', verified: true },
  { id: 'bd-khl-3', name: 'Harun Or Rashid', bloodGroup: 'O+', location: 'Sonadanga, Khulna', district: 'Khulna', phone: '+8801711003803', verified: true },
  { id: 'bd-khl-4', name: 'Jesmin Akter', bloodGroup: 'AB+', location: 'Dumuria, Khulna', district: 'Khulna', phone: '+8801711003804', verified: false },
  { id: 'bd-khl-5', name: 'Biplab Kumar', bloodGroup: 'O-', location: 'Batiaghata, Khulna', district: 'Khulna', phone: '+8801711003805', verified: true },
  // Kushtia
  { id: 'bd-kst-1', name: 'Forkan Ali', bloodGroup: 'O+', location: 'Kushtia Sadar, Kushtia', district: 'Kushtia', phone: '+8801711003901', verified: true },
  { id: 'bd-kst-2', name: 'Rahima Begum', bloodGroup: 'A+', location: 'Kumarkhali, Kushtia', district: 'Kushtia', phone: '+8801711003902', verified: true },
  { id: 'bd-kst-3', name: 'Latif Hossain', bloodGroup: 'B+', location: 'Mirpur, Kushtia', district: 'Kushtia', phone: '+8801711003903', verified: false },
  { id: 'bd-kst-4', name: 'Sabrina Nahar', bloodGroup: 'AB+', location: 'Bheramara, Kushtia', district: 'Kushtia', phone: '+8801711003904', verified: true },
  // Magura
  { id: 'bd-mgr-1', name: 'Hafiz Ahmed', bloodGroup: 'A+', location: 'Magura Sadar, Magura', district: 'Magura', phone: '+8801711004001', verified: true },
  { id: 'bd-mgr-2', name: 'Salma Nasrin', bloodGroup: 'B+', location: 'Mohammadpur, Magura', district: 'Magura', phone: '+8801711004002', verified: true },
  { id: 'bd-mgr-3', name: 'Jahirul Islam', bloodGroup: 'O+', location: 'Shalikha, Magura', district: 'Magura', phone: '+8801711004003', verified: false },
  { id: 'bd-mgr-4', name: 'Monowara Begum', bloodGroup: 'O-', location: 'Sreepur, Magura', district: 'Magura', phone: '+8801711004004', verified: true },
  // Meherpur
  { id: 'bd-mhp-1', name: 'Alamin Sarker', bloodGroup: 'B+', location: 'Meherpur Sadar, Meherpur', district: 'Meherpur', phone: '+8801711004101', verified: true },
  { id: 'bd-mhp-2', name: 'Chandana Rani', bloodGroup: 'A+', location: 'Gangni, Meherpur', district: 'Meherpur', phone: '+8801711004102', verified: true },
  { id: 'bd-mhp-3', name: 'Khokon Miah', bloodGroup: 'O+', location: 'Mujibnagar, Meherpur', district: 'Meherpur', phone: '+8801711004103', verified: false },
  { id: 'bd-mhp-4', name: 'Shiuly Akter', bloodGroup: 'AB+', location: 'Meherpur Sadar, Meherpur', district: 'Meherpur', phone: '+8801711004104', verified: true },
  // Narail
  { id: 'bd-nrl-1', name: 'Salam Fakir', bloodGroup: 'O+', location: 'Narail Sadar, Narail', district: 'Narail', phone: '+8801711004201', verified: true },
  { id: 'bd-nrl-2', name: 'Shapla Begum', bloodGroup: 'A+', location: 'Lohagara, Narail', district: 'Narail', phone: '+8801711004202', verified: true },
  { id: 'bd-nrl-3', name: 'Tofazzal Hossain', bloodGroup: 'B+', location: 'Kalia, Narail', district: 'Narail', phone: '+8801711004203', verified: false },
  { id: 'bd-nrl-4', name: 'Lucky Akter', bloodGroup: 'AB-', location: 'Narail Sadar, Narail', district: 'Narail', phone: '+8801711004204', verified: true },
  // Satkhira
  { id: 'bd-stk-1', name: 'Rezaul Karim', bloodGroup: 'A+', location: 'Satkhira Sadar, Satkhira', district: 'Satkhira', phone: '+8801711004301', verified: true },
  { id: 'bd-stk-2', name: 'Champa Rani', bloodGroup: 'B+', location: 'Shyamnagar, Satkhira', district: 'Satkhira', phone: '+8801711004302', verified: true },
  { id: 'bd-stk-3', name: 'Belal Hossain', bloodGroup: 'O+', location: 'Kaliganj, Satkhira', district: 'Satkhira', phone: '+8801711004303', verified: false },
  { id: 'bd-stk-4', name: 'Panna Begum', bloodGroup: 'O-', location: 'Debhata, Satkhira', district: 'Satkhira', phone: '+8801711004304', verified: true },

  // ========== MYMENSINGH DIVISION ==========
  // Jamalpur
  { id: 'bd-jml-1', name: 'Motiar Rahman', bloodGroup: 'B+', location: 'Jamalpur Sadar, Jamalpur', district: 'Jamalpur', phone: '+8801711004401', verified: true },
  { id: 'bd-jml-2', name: 'Aklima Begum', bloodGroup: 'A+', location: 'Dewanganj, Jamalpur', district: 'Jamalpur', phone: '+8801711004402', verified: true },
  { id: 'bd-jml-3', name: 'Sadek Ali', bloodGroup: 'O+', location: 'Islampur, Jamalpur', district: 'Jamalpur', phone: '+8801711004403', verified: false },
  { id: 'bd-jml-4', name: 'Rashida Khatun', bloodGroup: 'AB+', location: 'Melandah, Jamalpur', district: 'Jamalpur', phone: '+8801711004404', verified: true },
  { id: 'bd-jml-5', name: 'Babu Miah', bloodGroup: 'B-', location: 'Sarishabari, Jamalpur', district: 'Jamalpur', phone: '+8801711004405', verified: true },
  // Mymensingh
  { id: 'bd-mym-1', name: 'Hashem Ali', bloodGroup: 'AB+', location: 'Valuka, Mymensingh', district: 'Mymensingh', phone: '+8801711004501', verified: true },
  { id: 'bd-mym-2', name: 'Shefali Akter', bloodGroup: 'A+', location: 'Mymensingh Sadar, Mymensingh', district: 'Mymensingh', phone: '+8801711004502', verified: true },
  { id: 'bd-mym-3', name: 'Jewel Rana', bloodGroup: 'O+', location: 'Trishal, Mymensingh', district: 'Mymensingh', phone: '+8801711004503', verified: false },
  { id: 'bd-mym-4', name: 'Bithi Begum', bloodGroup: 'B+', location: 'Bhaluka, Mymensingh', district: 'Mymensingh', phone: '+8801711004504', verified: true },
  { id: 'bd-mym-5', name: 'Kamrul Islam', bloodGroup: 'A-', location: 'Fulbaria, Mymensingh', district: 'Mymensingh', phone: '+8801711004505', verified: true },
  { id: 'bd-mym-6', name: 'Nusrat Akter', bloodGroup: 'O-', location: 'Gafargaon, Mymensingh', district: 'Mymensingh', phone: '+8801711004506', verified: true },
  // Netrokona
  { id: 'bd-ntk-1', name: 'Abdul Mannan', bloodGroup: 'O+', location: 'Netrokona Sadar, Netrokona', district: 'Netrokona', phone: '+8801711004601', verified: true },
  { id: 'bd-ntk-2', name: 'Parvin Akter', bloodGroup: 'A+', location: 'Madan, Netrokona', district: 'Netrokona', phone: '+8801711004602', verified: true },
  { id: 'bd-ntk-3', name: 'Hanif Miah', bloodGroup: 'B+', location: 'Mohanganj, Netrokona', district: 'Netrokona', phone: '+8801711004603', verified: false },
  { id: 'bd-ntk-4', name: 'Rowshan Ara', bloodGroup: 'AB+', location: 'Kendua, Netrokona', district: 'Netrokona', phone: '+8801711004604', verified: true },
  // Sherpur
  { id: 'bd-shr-1', name: 'Mahabub Alam', bloodGroup: 'A+', location: 'Sherpur Sadar, Sherpur', district: 'Sherpur', phone: '+8801711004701', verified: true },
  { id: 'bd-shr-2', name: 'Josna Begum', bloodGroup: 'B+', location: 'Nakla, Sherpur', district: 'Sherpur', phone: '+8801711004702', verified: true },
  { id: 'bd-shr-3', name: 'Mokbul Hossain', bloodGroup: 'O+', location: 'Jhenaigati, Sherpur', district: 'Sherpur', phone: '+8801711004703', verified: false },
  { id: 'bd-shr-4', name: 'Ratna Begum', bloodGroup: 'O-', location: 'Nalitabari, Sherpur', district: 'Sherpur', phone: '+8801711004704', verified: true },

  // ========== RAJSHAHI DIVISION ==========
  // Bogura
  { id: 'bd-bgr-1', name: 'Nazmul Huda', bloodGroup: 'B+', location: 'Bogura Sadar, Bogura', district: 'Bogura', phone: '+8801711004801', verified: true },
  { id: 'bd-bgr-2', name: 'Halima Khatun', bloodGroup: 'A+', location: 'Shibganj, Bogura', district: 'Bogura', phone: '+8801711004802', verified: true },
  { id: 'bd-bgr-3', name: 'Shohidul Islam', bloodGroup: 'O+', location: 'Nandigram, Bogura', district: 'Bogura', phone: '+8801711004803', verified: false },
  { id: 'bd-bgr-4', name: 'Kohinoor Begum', bloodGroup: 'AB+', location: 'Dhunat, Bogura', district: 'Bogura', phone: '+8801711004804', verified: true },
  { id: 'bd-bgr-5', name: 'Jewel Hossain', bloodGroup: 'B-', location: 'Gabtali, Bogura', district: 'Bogura', phone: '+8801711004805', verified: true },
  // Chapai Nawabganj
  { id: 'bd-cpn-1', name: 'Abul Bashar', bloodGroup: 'O+', location: 'Chapai Nawabganj Sadar, Chapai Nawabganj', district: 'Chapai Nawabganj', phone: '+8801711004901', verified: true },
  { id: 'bd-cpn-2', name: 'Shahanara Begum', bloodGroup: 'A+', location: 'Shibganj, Chapai Nawabganj', district: 'Chapai Nawabganj', phone: '+8801711004902', verified: true },
  { id: 'bd-cpn-3', name: 'Nur Mohammad', bloodGroup: 'B+', location: 'Gomastapur, Chapai Nawabganj', district: 'Chapai Nawabganj', phone: '+8801711004903', verified: false },
  { id: 'bd-cpn-4', name: 'Mosammat Rina', bloodGroup: 'AB-', location: 'Nachole, Chapai Nawabganj', district: 'Chapai Nawabganj', phone: '+8801711004904', verified: true },
  // Joypurhat
  { id: 'bd-jyp-1', name: 'Dulal Hossain', bloodGroup: 'A+', location: 'Joypurhat Sadar, Joypurhat', district: 'Joypurhat', phone: '+8801711005001', verified: true },
  { id: 'bd-jyp-2', name: 'Rina Begum', bloodGroup: 'B+', location: 'Khetlal, Joypurhat', district: 'Joypurhat', phone: '+8801711005002', verified: true },
  { id: 'bd-jyp-3', name: 'Shafiq Uddin', bloodGroup: 'O+', location: 'Akkelpur, Joypurhat', district: 'Joypurhat', phone: '+8801711005003', verified: false },
  { id: 'bd-jyp-4', name: 'Bilkis Akter', bloodGroup: 'O-', location: 'Kalai, Joypurhat', district: 'Joypurhat', phone: '+8801711005004', verified: true },
  // Naogaon
  { id: 'bd-nao-1', name: 'Motiur Rahman', bloodGroup: 'B+', location: 'Naogaon Sadar, Naogaon', district: 'Naogaon', phone: '+8801711005101', verified: true },
  { id: 'bd-nao-2', name: 'Ranu Begum', bloodGroup: 'A+', location: 'Manda, Naogaon', district: 'Naogaon', phone: '+8801711005102', verified: true },
  { id: 'bd-nao-3', name: 'Ataur Rahman', bloodGroup: 'O+', location: 'Patnitala, Naogaon', district: 'Naogaon', phone: '+8801711005103', verified: false },
  { id: 'bd-nao-4', name: 'Jhuma Khatun', bloodGroup: 'AB+', location: 'Badalgachhi, Naogaon', district: 'Naogaon', phone: '+8801711005104', verified: true },
  { id: 'bd-nao-5', name: 'Sirajul Islam', bloodGroup: 'A-', location: 'Dhamoirhat, Naogaon', district: 'Naogaon', phone: '+8801711005105', verified: true },
  // Natore
  { id: 'bd-ntr-1', name: 'Moktar Hossain', bloodGroup: 'O+', location: 'Natore Sadar, Natore', district: 'Natore', phone: '+8801711005201', verified: true },
  { id: 'bd-ntr-2', name: 'Lily Begum', bloodGroup: 'A+', location: 'Baraigram, Natore', district: 'Natore', phone: '+8801711005202', verified: true },
  { id: 'bd-ntr-3', name: 'Altaf Hossain', bloodGroup: 'B+', location: 'Singra, Natore', district: 'Natore', phone: '+8801711005203', verified: false },
  { id: 'bd-ntr-4', name: 'Nargis Akter', bloodGroup: 'AB+', location: 'Gurudaspur, Natore', district: 'Natore', phone: '+8801711005204', verified: true },
  // Pabna
  { id: 'bd-pab-1', name: 'Zahangir Alam', bloodGroup: 'A+', location: 'Pabna Sadar, Pabna', district: 'Pabna', phone: '+8801711005301', verified: true },
  { id: 'bd-pab-2', name: 'Rokeya Sultana', bloodGroup: 'B+', location: 'Ishwardi, Pabna', district: 'Pabna', phone: '+8801711005302', verified: true },
  { id: 'bd-pab-3', name: 'Azad Rahman', bloodGroup: 'O+', location: 'Chatmohar, Pabna', district: 'Pabna', phone: '+8801711005303', verified: false },
  { id: 'bd-pab-4', name: 'Sumaiya Ferdous', bloodGroup: 'O-', location: 'Bera, Pabna', district: 'Pabna', phone: '+8801711005304', verified: true },
  // Rajshahi
  { id: 'bd-raj-1', name: 'Shamsuzzaman', bloodGroup: 'B+', location: 'Rajshahi Sadar, Rajshahi', district: 'Rajshahi', phone: '+8801711005401', verified: true },
  { id: 'bd-raj-2', name: 'Meghla Begum', bloodGroup: 'A+', location: 'Boalia, Rajshahi', district: 'Rajshahi', phone: '+8801711005402', verified: true },
  { id: 'bd-raj-3', name: 'Asaduzzaman', bloodGroup: 'O+', location: 'Shah Makhdum, Rajshahi', district: 'Rajshahi', phone: '+8801711005403', verified: true },
  { id: 'bd-raj-4', name: 'Naima Sultana', bloodGroup: 'AB+', location: 'Godagari, Rajshahi', district: 'Rajshahi', phone: '+8801711005404', verified: false },
  { id: 'bd-raj-5', name: 'Palash Kumar', bloodGroup: 'B-', location: 'Puthia, Rajshahi', district: 'Rajshahi', phone: '+8801711005405', verified: true },
  // Sirajganj
  { id: 'bd-srj-1', name: 'Moklesur Rahman', bloodGroup: 'O+', location: 'Sirajganj Sadar, Sirajganj', district: 'Sirajganj', phone: '+8801711005501', verified: true },
  { id: 'bd-srj-2', name: 'Joly Begum', bloodGroup: 'A+', location: 'Shahzadpur, Sirajganj', district: 'Sirajganj', phone: '+8801711005502', verified: true },
  { id: 'bd-srj-3', name: 'Sohrab Hossain', bloodGroup: 'B+', location: 'Belkuchi, Sirajganj', district: 'Sirajganj', phone: '+8801711005503', verified: false },
  { id: 'bd-srj-4', name: 'Asha Devi', bloodGroup: 'AB-', location: 'Ullapara, Sirajganj', district: 'Sirajganj', phone: '+8801711005504', verified: true },

  // ========== RANGPUR DIVISION ==========
  // Dinajpur
  { id: 'bd-dnj-1', name: 'Ruhul Amin', bloodGroup: 'A+', location: 'Dinajpur Sadar, Dinajpur', district: 'Dinajpur', phone: '+8801711005601', verified: true },
  { id: 'bd-dnj-2', name: 'Maya Rani', bloodGroup: 'B+', location: 'Birampur, Dinajpur', district: 'Dinajpur', phone: '+8801711005602', verified: true },
  { id: 'bd-dnj-3', name: 'Sobhan Miah', bloodGroup: 'O+', location: 'Parbatipur, Dinajpur', district: 'Dinajpur', phone: '+8801711005603', verified: false },
  { id: 'bd-dnj-4', name: 'Diba Akter', bloodGroup: 'AB+', location: 'Fulbari, Dinajpur', district: 'Dinajpur', phone: '+8801711005604', verified: true },
  { id: 'bd-dnj-5', name: 'Sagor Kumar', bloodGroup: 'O-', location: 'Birganj, Dinajpur', district: 'Dinajpur', phone: '+8801711005605', verified: true },
  // Gaibandha
  { id: 'bd-gbn-1', name: 'Farid Ahmed', bloodGroup: 'B+', location: 'Gaibandha Sadar, Gaibandha', district: 'Gaibandha', phone: '+8801711005701', verified: true },
  { id: 'bd-gbn-2', name: 'Anju Akter', bloodGroup: 'A+', location: 'Sundarganj, Gaibandha', district: 'Gaibandha', phone: '+8801711005702', verified: true },
  { id: 'bd-gbn-3', name: 'Nurul Huda', bloodGroup: 'O+', location: 'Gobindaganj, Gaibandha', district: 'Gaibandha', phone: '+8801711005703', verified: false },
  { id: 'bd-gbn-4', name: 'Salma Khatun', bloodGroup: 'AB+', location: 'Sadullapur, Gaibandha', district: 'Gaibandha', phone: '+8801711005704', verified: true },
  // Kurigram
  { id: 'bd-krg-1', name: 'Mozaffar Hossain', bloodGroup: 'O+', location: 'Kurigram Sadar, Kurigram', district: 'Kurigram', phone: '+8801711005801', verified: true },
  { id: 'bd-krg-2', name: 'Rashida Begum', bloodGroup: 'A+', location: 'Nageshwari, Kurigram', district: 'Kurigram', phone: '+8801711005802', verified: true },
  { id: 'bd-krg-3', name: 'Saidul Islam', bloodGroup: 'B+', location: 'Bhurungamari, Kurigram', district: 'Kurigram', phone: '+8801711005803', verified: false },
  { id: 'bd-krg-4', name: 'Fulkoli Akter', bloodGroup: 'O-', location: 'Ulipur, Kurigram', district: 'Kurigram', phone: '+8801711005804', verified: true },
  // Lalmonirhat
  { id: 'bd-lmn-1', name: 'Abul Hashem', bloodGroup: 'A+', location: 'Lalmonirhat Sadar, Lalmonirhat', district: 'Lalmonirhat', phone: '+8801711005901', verified: true },
  { id: 'bd-lmn-2', name: 'Surabhi Begum', bloodGroup: 'B+', location: 'Kaliganj, Lalmonirhat', district: 'Lalmonirhat', phone: '+8801711005902', verified: true },
  { id: 'bd-lmn-3', name: 'Tajul Islam', bloodGroup: 'O+', location: 'Hatibandha, Lalmonirhat', district: 'Lalmonirhat', phone: '+8801711005903', verified: false },
  { id: 'bd-lmn-4', name: 'Nilima Rani', bloodGroup: 'AB+', location: 'Aditmari, Lalmonirhat', district: 'Lalmonirhat', phone: '+8801711005904', verified: true },
  // Nilphamari
  { id: 'bd-nlp-1', name: 'Golam Sarwar', bloodGroup: 'B+', location: 'Nilphamari Sadar, Nilphamari', district: 'Nilphamari', phone: '+8801711006001', verified: true },
  { id: 'bd-nlp-2', name: 'Shirina Begum', bloodGroup: 'A+', location: 'Saidpur, Nilphamari', district: 'Nilphamari', phone: '+8801711006002', verified: true },
  { id: 'bd-nlp-3', name: 'Badiuzzaman', bloodGroup: 'O+', location: 'Domar, Nilphamari', district: 'Nilphamari', phone: '+8801711006003', verified: false },
  { id: 'bd-nlp-4', name: 'Kalpana Rani', bloodGroup: 'AB-', location: 'Jaldhaka, Nilphamari', district: 'Nilphamari', phone: '+8801711006004', verified: true },
  // Panchagarh
  { id: 'bd-pcg-1', name: 'Sirajul Haque', bloodGroup: 'O+', location: 'Panchagarh Sadar, Panchagarh', district: 'Panchagarh', phone: '+8801711006101', verified: true },
  { id: 'bd-pcg-2', name: 'Tamanna Begum', bloodGroup: 'A+', location: 'Tetulia, Panchagarh', district: 'Panchagarh', phone: '+8801711006102', verified: true },
  { id: 'bd-pcg-3', name: 'Ranjit Kumar', bloodGroup: 'B+', location: 'Debiganj, Panchagarh', district: 'Panchagarh', phone: '+8801711006103', verified: false },
  { id: 'bd-pcg-4', name: 'Flora Akter', bloodGroup: 'AB+', location: 'Boda, Panchagarh', district: 'Panchagarh', phone: '+8801711006104', verified: true },
  // Rangpur
  { id: 'bd-rgp-1', name: 'Tuhin Sarker', bloodGroup: 'O+', location: 'Rangpur Sadar, Rangpur', district: 'Rangpur', phone: '+8801711006201', verified: true },
  { id: 'bd-rgp-2', name: 'Shamim Reza', bloodGroup: 'B+', location: 'Pirganj, Rangpur', district: 'Rangpur', phone: '+8801711006202', verified: true },
  { id: 'bd-rgp-3', name: 'Nasima Khatun', bloodGroup: 'A+', location: 'Badarganj, Rangpur', district: 'Rangpur', phone: '+8801711006203', verified: false },
  { id: 'bd-rgp-4', name: 'Enamul Haque', bloodGroup: 'AB+', location: 'Mithapukur, Rangpur', district: 'Rangpur', phone: '+8801711006204', verified: true },
  { id: 'bd-rgp-5', name: 'Brishti Akter', bloodGroup: 'A-', location: 'Kaunia, Rangpur', district: 'Rangpur', phone: '+8801711006205', verified: true },
  // Thakurgaon
  { id: 'bd-thk-1', name: 'Anwar Hossain', bloodGroup: 'A+', location: 'Thakurgaon Sadar, Thakurgaon', district: 'Thakurgaon', phone: '+8801711006301', verified: true },
  { id: 'bd-thk-2', name: 'Rekha Rani', bloodGroup: 'B+', location: 'Pirganj, Thakurgaon', district: 'Thakurgaon', phone: '+8801711006302', verified: true },
  { id: 'bd-thk-3', name: 'Hamidul Islam', bloodGroup: 'O+', location: 'Ranisankail, Thakurgaon', district: 'Thakurgaon', phone: '+8801711006303', verified: false },
  { id: 'bd-thk-4', name: 'Sonali Begum', bloodGroup: 'O-', location: 'Baliadangi, Thakurgaon', district: 'Thakurgaon', phone: '+8801711006304', verified: true },

  // ========== SYLHET DIVISION ==========
  // Habiganj
  { id: 'bd-hbg-1', name: 'Iqbal Hossain', bloodGroup: 'B+', location: 'Habiganj Sadar, Habiganj', district: 'Habiganj', phone: '+8801711006401', verified: true },
  { id: 'bd-hbg-2', name: 'Shahnaj Akter', bloodGroup: 'A+', location: 'Nabiganj, Habiganj', district: 'Habiganj', phone: '+8801711006402', verified: true },
  { id: 'bd-hbg-3', name: 'Manik Chandra', bloodGroup: 'O+', location: 'Baniachong, Habiganj', district: 'Habiganj', phone: '+8801711006403', verified: false },
  { id: 'bd-hbg-4', name: 'Roksana Begum', bloodGroup: 'AB+', location: 'Chunarughat, Habiganj', district: 'Habiganj', phone: '+8801711006404', verified: true },
  { id: 'bd-hbg-5', name: 'Samir Das', bloodGroup: 'A-', location: 'Madhabpur, Habiganj', district: 'Habiganj', phone: '+8801711006405', verified: true },
  // Moulvibazar
  { id: 'bd-mvb-1', name: 'Shamsul Alam', bloodGroup: 'O+', location: 'Moulvibazar Sadar, Moulvibazar', district: 'Moulvibazar', phone: '+8801711006501', verified: true },
  { id: 'bd-mvb-2', name: 'Tahmina Akter', bloodGroup: 'A+', location: 'Sreemangal, Moulvibazar', district: 'Moulvibazar', phone: '+8801711006502', verified: true },
  { id: 'bd-mvb-3', name: 'Pintu Miah', bloodGroup: 'B+', location: 'Kamalganj, Moulvibazar', district: 'Moulvibazar', phone: '+8801711006503', verified: false },
  { id: 'bd-mvb-4', name: 'Jhilmil Begum', bloodGroup: 'AB-', location: 'Kulaura, Moulvibazar', district: 'Moulvibazar', phone: '+8801711006504', verified: true },
  // Sunamganj
  { id: 'bd-sng-1', name: 'Faruk Ahmed', bloodGroup: 'A+', location: 'Sunamganj Sadar, Sunamganj', district: 'Sunamganj', phone: '+8801711006601', verified: true },
  { id: 'bd-sng-2', name: 'Monjila Khatun', bloodGroup: 'B+', location: 'Derai, Sunamganj', district: 'Sunamganj', phone: '+8801711006602', verified: true },
  { id: 'bd-sng-3', name: 'Habib Sarker', bloodGroup: 'O+', location: 'Dharampasha, Sunamganj', district: 'Sunamganj', phone: '+8801711006603', verified: false },
  { id: 'bd-sng-4', name: 'Eti Akter', bloodGroup: 'O-', location: 'Tahirpur, Sunamganj', district: 'Sunamganj', phone: '+8801711006604', verified: true },
  // Sylhet
  { id: 'bd-syl-1', name: 'Touhid Ahmed', bloodGroup: 'B+', location: 'Sylhet Sadar, Sylhet', district: 'Sylhet', phone: '+8801711006701', verified: true },
  { id: 'bd-syl-2', name: 'Marium Begum', bloodGroup: 'A+', location: 'Jaintiapur, Sylhet', district: 'Sylhet', phone: '+8801711006702', verified: true },
  { id: 'bd-syl-3', name: 'Zakir Hossain', bloodGroup: 'O+', location: 'Golapganj, Sylhet', district: 'Sylhet', phone: '+8801711006703', verified: true },
  { id: 'bd-syl-4', name: 'Limon Das', bloodGroup: 'AB+', location: 'Beanibazar, Sylhet', district: 'Sylhet', phone: '+8801711006704', verified: false },
  { id: 'bd-syl-5', name: 'Mitali Rani', bloodGroup: 'B-', location: 'Companiganj, Sylhet', district: 'Sylhet', phone: '+8801711006705', verified: true },
  { id: 'bd-syl-6', name: 'Ashiq Miah', bloodGroup: 'A-', location: 'Biswanath, Sylhet', district: 'Sylhet', phone: '+8801711006706', verified: true },
];

// District center coordinates (lat, lng) for reverse geolocation
export const DISTRICT_COORDINATES: Record<string, [number, number]> = {
  'Barguna': [22.1503, 90.1266],
  'Barishal': [22.7010, 90.3535],
  'Bhola': [22.6859, 90.6482],
  'Jhalokati': [22.6406, 90.1987],
  'Patuakhali': [22.3596, 90.3290],
  'Pirojpur': [22.5781, 89.9750],
  'Bandarban': [22.1953, 92.2184],
  'Brahmanbaria': [23.9608, 91.1115],
  'Chandpur': [23.2333, 90.6712],
  'Chattogram': [22.3569, 91.7832],
  'Comilla': [23.4607, 91.1809],
  "Cox's Bazar": [21.4272, 92.0058],
  'Feni': [23.0159, 91.3976],
  'Khagrachari': [23.1322, 91.9490],
  'Lakshmipur': [22.9425, 90.8412],
  'Noakhali': [22.8696, 91.0995],
  'Rangamati': [22.7324, 92.2985],
  'Dhaka': [23.8103, 90.4125],
  'Faridpur': [23.6070, 89.8420],
  'Gazipur': [24.0023, 90.4264],
  'Gopalganj': [23.0050, 89.8266],
  'Kishoreganj': [24.4449, 90.7766],
  'Madaripur': [23.1641, 90.1978],
  'Manikganj': [23.8617, 90.0003],
  'Munshiganj': [23.5422, 90.5305],
  'Narayanganj': [23.6238, 90.5000],
  'Narsingdi': [23.9322, 90.7151],
  'Rajbari': [23.7574, 89.6445],
  'Shariatpur': [23.2423, 90.4348],
  'Tangail': [24.2513, 89.9164],
  'Bagerhat': [22.6516, 89.7859],
  'Chuadanga': [23.6401, 88.8420],
  'Jashore': [23.1665, 89.2095],
  'Jhenaidah': [23.5448, 89.1726],
  'Khulna': [22.8456, 89.5403],
  'Kushtia': [23.9013, 89.1200],
  'Magura': [23.4872, 89.4500],
  'Meherpur': [23.7622, 88.6318],
  'Narail': [23.1725, 89.5127],
  'Satkhira': [22.7185, 89.0715],
  'Jamalpur': [24.9375, 89.9372],
  'Mymensingh': [24.7471, 90.4203],
  'Netrokona': [24.8707, 90.7279],
  'Sherpur': [25.0204, 90.0153],
  'Bogura': [24.8465, 89.3773],
  'Chapai Nawabganj': [24.5965, 88.2775],
  'Joypurhat': [25.0968, 89.0227],
  'Naogaon': [24.7936, 88.9318],
  'Natore': [24.4206, 89.0000],
  'Pabna': [24.0064, 89.2372],
  'Rajshahi': [24.3745, 88.6042],
  'Sirajganj': [24.4533, 89.7000],
  'Dinajpur': [25.6217, 88.6355],
  'Gaibandha': [25.3288, 89.5286],
  'Kurigram': [25.8072, 89.6364],
  'Lalmonirhat': [25.9165, 89.4447],
  'Nilphamari': [25.9316, 88.8560],
  'Panchagarh': [26.3411, 88.5542],
  'Rangpur': [25.7439, 89.2752],
  'Thakurgaon': [26.0336, 88.4616],
  'Habiganj': [24.3745, 91.4155],
  'Moulvibazar': [24.4829, 91.7774],
  'Sunamganj': [25.0658, 91.3950],
  'Sylhet': [24.8949, 91.8687],
};

/**
 * Find the nearest district to given lat/lng coordinates
 * Uses Haversine distance calculation
 */
export const findNearestDistrict = (lat: number, lng: number): string => {
  let nearest = 'Dhaka';
  let minDist = Infinity;

  for (const [district, [dLat, dLng]] of Object.entries(DISTRICT_COORDINATES)) {
    // Haversine formula
    const R = 6371; // km
    const dLatR = ((dLat - lat) * Math.PI) / 180;
    const dLngR = ((dLng - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLatR / 2) * Math.sin(dLatR / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((dLat * Math.PI) / 180) *
        Math.sin(dLngR / 2) *
        Math.sin(dLngR / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;

    if (dist < minDist) {
      minDist = dist;
      nearest = district;
    }
  }
  return nearest;
};

// Helper: get donor count per district
export const getDonorCountByDistrict = (): Record<string, number> => {
  const counts: Record<string, number> = {};
  DISTRICT_DONORS.forEach(d => {
    counts[d.district] = (counts[d.district] || 0) + 1;
  });
  return counts;
};

// Helper: get division for a district
export const getDivisionForDistrict = (district: string): string | undefined => {
  for (const [division, districts] of Object.entries(BANGLADESH_DIVISIONS)) {
    if (districts.includes(district)) return division;
  }
  return undefined;
};
