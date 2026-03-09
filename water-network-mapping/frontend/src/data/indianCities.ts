export interface City {
    id: string;
    name: string;
    state: string;
}

// Major Indian cities with auto-generated IDs
export const INDIAN_CITIES: City[] = [
    // Andhra Pradesh
    { id: 'VIS-AP', name: 'Visakhapatnam', state: 'Andhra Pradesh' },
    { id: 'VIJ-AP', name: 'Vijayawada', state: 'Andhra Pradesh' },
    { id: 'GUN-AP', name: 'Guntur', state: 'Andhra Pradesh' },
    { id: 'NEL-AP', name: 'Nellore', state: 'Andhra Pradesh' },
    { id: 'KUR-AP', name: 'Kurnool', state: 'Andhra Pradesh' },
    { id: 'RAJ-AP', name: 'Rajahmundry', state: 'Andhra Pradesh' },
    { id: 'TIR-AP', name: 'Tirupati', state: 'Andhra Pradesh' },
    { id: 'KAK-AP', name: 'Kakinada', state: 'Andhra Pradesh' },
    { id: 'ANT-AP', name: 'Anantapur', state: 'Andhra Pradesh' },

    // Arunachal Pradesh
    { id: 'ITA-AR', name: 'Itanagar', state: 'Arunachal Pradesh' },

    // Assam
    { id: 'GUW-AS', name: 'Guwahati', state: 'Assam' },
    { id: 'SIL-AS', name: 'Silchar', state: 'Assam' },
    { id: 'DIB-AS', name: 'Dibrugarh', state: 'Assam' },
    { id: 'JOR-AS', name: 'Jorhat', state: 'Assam' },

    // Bihar
    { id: 'PAT-BR', name: 'Patna', state: 'Bihar' },
    { id: 'GAY-BR', name: 'Gaya', state: 'Bihar' },
    { id: 'BHA-BR', name: 'Bhagalpur', state: 'Bihar' },
    { id: 'MUZ-BR', name: 'Muzaffarpur', state: 'Bihar' },
    { id: 'PUR-BR', name: 'Purnia', state: 'Bihar' },
    { id: 'DAR-BR', name: 'Darbhanga', state: 'Bihar' },

    // Chhattisgarh
    { id: 'RAI-CG', name: 'Raipur', state: 'Chhattisgarh' },
    { id: 'BHI-CG', name: 'Bhilai', state: 'Chhattisgarh' },
    { id: 'BIL-CG', name: 'Bilaspur', state: 'Chhattisgarh' },
    { id: 'KOR-CG', name: 'Korba', state: 'Chhattisgarh' },

    // Delhi
    { id: 'DEL-DL', name: 'New Delhi', state: 'Delhi' },

    // Goa
    { id: 'PAN-GA', name: 'Panaji', state: 'Goa' },
    { id: 'MAR-GA', name: 'Margao', state: 'Goa' },
    { id: 'VAS-GA', name: 'Vasco da Gama', state: 'Goa' },

    // Gujarat
    { id: 'AHM-GJ', name: 'Ahmedabad', state: 'Gujarat' },
    { id: 'SUR-GJ', name: 'Surat', state: 'Gujarat' },
    { id: 'VAD-GJ', name: 'Vadodara', state: 'Gujarat' },
    { id: 'RAJ-GJ', name: 'Rajkot', state: 'Gujarat' },
    { id: 'BHA-GJ', name: 'Bhavnagar', state: 'Gujarat' },
    { id: 'JAM-GJ', name: 'Jamnagar', state: 'Gujarat' },
    { id: 'GAN-GJ', name: 'Gandhinagar', state: 'Gujarat' },
    { id: 'JUN-GJ', name: 'Junagadh', state: 'Gujarat' },

    // Haryana
    { id: 'FAR-HR', name: 'Faridabad', state: 'Haryana' },
    { id: 'GUR-HR', name: 'Gurugram', state: 'Haryana' },
    { id: 'PAN-HR', name: 'Panipat', state: 'Haryana' },
    { id: 'AMB-HR', name: 'Ambala', state: 'Haryana' },
    { id: 'KAR-HR', name: 'Karnal', state: 'Haryana' },
    { id: 'HIS-HR', name: 'Hisar', state: 'Haryana' },
    { id: 'ROH-HR', name: 'Rohtak', state: 'Haryana' },
    { id: 'SON-HR', name: 'Sonipat', state: 'Haryana' },
    { id: 'YAM-HR', name: 'Yamunanagar', state: 'Haryana' },

    // Himachal Pradesh
    { id: 'SHI-HP', name: 'Shimla', state: 'Himachal Pradesh' },
    { id: 'DHA-HP', name: 'Dharamshala', state: 'Himachal Pradesh' },
    { id: 'MAN-HP', name: 'Manali', state: 'Himachal Pradesh' },

    // Jharkhand
    { id: 'RAN-JH', name: 'Ranchi', state: 'Jharkhand' },
    { id: 'JAM-JH', name: 'Jamshedpur', state: 'Jharkhand' },
    { id: 'DHA-JH', name: 'Dhanbad', state: 'Jharkhand' },
    { id: 'BOK-JH', name: 'Bokaro', state: 'Jharkhand' },

    // Karnataka
    { id: 'BEN-KA', name: 'Bengaluru', state: 'Karnataka' },
    { id: 'MYS-KA', name: 'Mysuru', state: 'Karnataka' },
    { id: 'HUB-KA', name: 'Hubballi-Dharwad', state: 'Karnataka' },
    { id: 'MAN-KA', name: 'Mangaluru', state: 'Karnataka' },
    { id: 'BEL-KA', name: 'Belagavi', state: 'Karnataka' },
    { id: 'GUL-KA', name: 'Kalaburagi', state: 'Karnataka' },
    { id: 'DAV-KA', name: 'Davanagere', state: 'Karnataka' },
    { id: 'SHI-KA', name: 'Shimoga', state: 'Karnataka' },
    { id: 'TUM-KA', name: 'Tumkur', state: 'Karnataka' },

    // Kerala
    { id: 'THI-KL', name: 'Thiruvananthapuram', state: 'Kerala' },
    { id: 'KOC-KL', name: 'Kochi', state: 'Kerala' },
    { id: 'KOZ-KL', name: 'Kozhikode', state: 'Kerala' },
    { id: 'THR-KL', name: 'Thrissur', state: 'Kerala' },
    { id: 'KOL-KL', name: 'Kollam', state: 'Kerala' },

    // Madhya Pradesh
    { id: 'BHO-MP', name: 'Bhopal', state: 'Madhya Pradesh' },
    { id: 'IND-MP', name: 'Indore', state: 'Madhya Pradesh' },
    { id: 'JAB-MP', name: 'Jabalpur', state: 'Madhya Pradesh' },
    { id: 'GWA-MP', name: 'Gwalior', state: 'Madhya Pradesh' },
    { id: 'UJJ-MP', name: 'Ujjain', state: 'Madhya Pradesh' },

    // Maharashtra
    { id: 'MUM-MH', name: 'Mumbai', state: 'Maharashtra' },
    { id: 'PUN-MH', name: 'Pune', state: 'Maharashtra' },
    { id: 'NAG-MH', name: 'Nagpur', state: 'Maharashtra' },
    { id: 'NAS-MH', name: 'Nashik', state: 'Maharashtra' },
    { id: 'AUR-MH', name: 'Aurangabad', state: 'Maharashtra' },
    { id: 'SOL-MH', name: 'Solapur', state: 'Maharashtra' },
    { id: 'KOL-MH', name: 'Kolhapur', state: 'Maharashtra' },
    { id: 'AMR-MH', name: 'Amravati', state: 'Maharashtra' },
    { id: 'THN-MH', name: 'Thane', state: 'Maharashtra' },
    { id: 'NVM-MH', name: 'Navi Mumbai', state: 'Maharashtra' },

    // Manipur
    { id: 'IMP-MN', name: 'Imphal', state: 'Manipur' },

    // Meghalaya
    { id: 'SHI-ML', name: 'Shillong', state: 'Meghalaya' },

    // Mizoram
    { id: 'AIZ-MZ', name: 'Aizawl', state: 'Mizoram' },

    // Nagaland
    { id: 'KOH-NL', name: 'Kohima', state: 'Nagaland' },
    { id: 'DIM-NL', name: 'Dimapur', state: 'Nagaland' },

    // Odisha
    { id: 'BHU-OD', name: 'Bhubaneswar', state: 'Odisha' },
    { id: 'CUT-OD', name: 'Cuttack', state: 'Odisha' },
    { id: 'ROU-OD', name: 'Rourkela', state: 'Odisha' },
    { id: 'PUR-OD', name: 'Puri', state: 'Odisha' },

    // Punjab
    { id: 'LUD-PB', name: 'Ludhiana', state: 'Punjab' },
    { id: 'AMR-PB', name: 'Amritsar', state: 'Punjab' },
    { id: 'JAL-PB', name: 'Jalandhar', state: 'Punjab' },
    { id: 'PAT-PB', name: 'Patiala', state: 'Punjab' },
    { id: 'BAT-PB', name: 'Bathinda', state: 'Punjab' },
    { id: 'MOH-PB', name: 'Mohali', state: 'Punjab' },

    // Rajasthan
    { id: 'JAI-RJ', name: 'Jaipur', state: 'Rajasthan' },
    { id: 'JOD-RJ', name: 'Jodhpur', state: 'Rajasthan' },
    { id: 'UDA-RJ', name: 'Udaipur', state: 'Rajasthan' },
    { id: 'KOT-RJ', name: 'Kota', state: 'Rajasthan' },
    { id: 'BIK-RJ', name: 'Bikaner', state: 'Rajasthan' },
    { id: 'AJM-RJ', name: 'Ajmer', state: 'Rajasthan' },
    { id: 'ALW-RJ', name: 'Alwar', state: 'Rajasthan' },

    // Sikkim
    { id: 'GAN-SK', name: 'Gangtok', state: 'Sikkim' },

    // Tamil Nadu
    { id: 'CHE-TN', name: 'Chennai', state: 'Tamil Nadu' },
    { id: 'COI-TN', name: 'Coimbatore', state: 'Tamil Nadu' },
    { id: 'MAD-TN', name: 'Madurai', state: 'Tamil Nadu' },
    { id: 'TIR-TN', name: 'Tiruchirappalli', state: 'Tamil Nadu' },
    { id: 'SAL-TN', name: 'Salem', state: 'Tamil Nadu' },
    { id: 'TIU-TN', name: 'Tirunelveli', state: 'Tamil Nadu' },
    { id: 'ERO-TN', name: 'Erode', state: 'Tamil Nadu' },
    { id: 'VEL-TN', name: 'Vellore', state: 'Tamil Nadu' },

    // Telangana
    { id: 'HYD-TG', name: 'Hyderabad', state: 'Telangana' },
    { id: 'WAR-TG', name: 'Warangal', state: 'Telangana' },
    { id: 'NIZ-TG', name: 'Nizamabad', state: 'Telangana' },
    { id: 'KAR-TG', name: 'Karimnagar', state: 'Telangana' },

    // Tripura
    { id: 'AGA-TR', name: 'Agartala', state: 'Tripura' },

    // Uttar Pradesh
    { id: 'LKO-UP', name: 'Lucknow', state: 'Uttar Pradesh' },
    { id: 'KAN-UP', name: 'Kanpur', state: 'Uttar Pradesh' },
    { id: 'AGR-UP', name: 'Agra', state: 'Uttar Pradesh' },
    { id: 'VAR-UP', name: 'Varanasi', state: 'Uttar Pradesh' },
    { id: 'ALL-UP', name: 'Prayagraj', state: 'Uttar Pradesh' },
    { id: 'MER-UP', name: 'Meerut', state: 'Uttar Pradesh' },
    { id: 'NOI-UP', name: 'Noida', state: 'Uttar Pradesh' },
    { id: 'GHA-UP', name: 'Ghaziabad', state: 'Uttar Pradesh' },
    { id: 'BAR-UP', name: 'Bareilly', state: 'Uttar Pradesh' },
    { id: 'ALG-UP', name: 'Aligarh', state: 'Uttar Pradesh' },
    { id: 'MOR-UP', name: 'Moradabad', state: 'Uttar Pradesh' },
    { id: 'SAH-UP', name: 'Saharanpur', state: 'Uttar Pradesh' },
    { id: 'GOR-UP', name: 'Gorakhpur', state: 'Uttar Pradesh' },
    { id: 'JHA-UP', name: 'Jhansi', state: 'Uttar Pradesh' },
    { id: 'MAT-UP', name: 'Mathura', state: 'Uttar Pradesh' },
    { id: 'FIR-UP', name: 'Firozabad', state: 'Uttar Pradesh' },
    { id: 'MUZ-UP', name: 'Muzaffarnagar', state: 'Uttar Pradesh' },
    { id: 'SHA-UP', name: 'Shahjahanpur', state: 'Uttar Pradesh' },
    { id: 'RAM-UP', name: 'Rampur', state: 'Uttar Pradesh' },
    { id: 'AYO-UP', name: 'Ayodhya', state: 'Uttar Pradesh' },

    // Uttarakhand
    { id: 'DEH-UK', name: 'Dehradun', state: 'Uttarakhand' },
    { id: 'HAR-UK', name: 'Haridwar', state: 'Uttarakhand' },
    { id: 'RIS-UK', name: 'Rishikesh', state: 'Uttarakhand' },
    { id: 'HAL-UK', name: 'Haldwani', state: 'Uttarakhand' },
    { id: 'RUD-UK', name: 'Rudrapur', state: 'Uttarakhand' },
    { id: 'KAS-UK', name: 'Kashipur', state: 'Uttarakhand' },
    { id: 'ROO-UK', name: 'Roorkee', state: 'Uttarakhand' },

    // West Bengal
    { id: 'KOL-WB', name: 'Kolkata', state: 'West Bengal' },
    { id: 'HOW-WB', name: 'Howrah', state: 'West Bengal' },
    { id: 'DUR-WB', name: 'Durgapur', state: 'West Bengal' },
    { id: 'ASA-WB', name: 'Asansol', state: 'West Bengal' },
    { id: 'SIL-WB', name: 'Siliguri', state: 'West Bengal' },

    // Union Territories
    { id: 'CHD-CH', name: 'Chandigarh', state: 'Chandigarh' },
    { id: 'PUD-PY', name: 'Puducherry', state: 'Puducherry' },
    { id: 'SRI-JK', name: 'Srinagar', state: 'Jammu & Kashmir' },
    { id: 'JAM-JK', name: 'Jammu', state: 'Jammu & Kashmir' },
    { id: 'POR-AN', name: 'Port Blair', state: 'Andaman & Nicobar' },
    { id: 'LEH-LA', name: 'Leh', state: 'Ladakh' },
];

export function searchCities(query: string): City[] {
    if (!query || query.length < 1) return [];
    const lower = query.toLowerCase();
    return INDIAN_CITIES.filter(
        (c) =>
            c.name.toLowerCase().includes(lower) ||
            c.state.toLowerCase().includes(lower) ||
            c.id.toLowerCase().includes(lower)
    ).slice(0, 10);
}

export function getCityById(id: string): City | undefined {
    return INDIAN_CITIES.find((c) => c.id === id);
}
