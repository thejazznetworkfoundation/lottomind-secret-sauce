export interface LotteryStoreData {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  zip: string;
  phone: string;
  rating: number;
  hours: string;
  lat: number;
  lng: number;
  games: string[];
  type: 'gas_station' | 'convenience' | 'grocery' | 'liquor' | 'pharmacy' | 'smoke_shop' | 'newsstand';
}

export interface USState {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

export const US_STATES: USState[] = [
  { code: 'AL', name: 'Alabama', lat: 32.806671, lng: -86.791130 },
  { code: 'AZ', name: 'Arizona', lat: 33.7298, lng: -111.4312 },
  { code: 'AR', name: 'Arkansas', lat: 34.9697, lng: -92.3731 },
  { code: 'CA', name: 'California', lat: 36.1162, lng: -119.6816 },
  { code: 'CO', name: 'Colorado', lat: 39.0598, lng: -105.3111 },
  { code: 'CT', name: 'Connecticut', lat: 41.5978, lng: -72.7554 },
  { code: 'DE', name: 'Delaware', lat: 39.3185, lng: -75.5071 },
  { code: 'FL', name: 'Florida', lat: 27.7663, lng: -81.6868 },
  { code: 'GA', name: 'Georgia', lat: 33.0406, lng: -83.6431 },
  { code: 'ID', name: 'Idaho', lat: 44.2405, lng: -114.4788 },
  { code: 'IL', name: 'Illinois', lat: 40.3495, lng: -88.9861 },
  { code: 'IN', name: 'Indiana', lat: 39.8494, lng: -86.2583 },
  { code: 'IA', name: 'Iowa', lat: 42.0115, lng: -93.2105 },
  { code: 'KS', name: 'Kansas', lat: 38.5266, lng: -96.7265 },
  { code: 'KY', name: 'Kentucky', lat: 37.6681, lng: -84.6701 },
  { code: 'LA', name: 'Louisiana', lat: 31.1695, lng: -91.8678 },
  { code: 'ME', name: 'Maine', lat: 44.6939, lng: -69.3819 },
  { code: 'MD', name: 'Maryland', lat: 39.0639, lng: -76.8021 },
  { code: 'MA', name: 'Massachusetts', lat: 42.2302, lng: -71.5301 },
  { code: 'MI', name: 'Michigan', lat: 43.3266, lng: -84.5361 },
  { code: 'MN', name: 'Minnesota', lat: 45.6945, lng: -93.9002 },
  { code: 'MO', name: 'Missouri', lat: 38.4561, lng: -92.2884 },
  { code: 'MT', name: 'Montana', lat: 46.9219, lng: -110.4544 },
  { code: 'NE', name: 'Nebraska', lat: 41.1254, lng: -98.2681 },
  { code: 'NH', name: 'New Hampshire', lat: 43.4525, lng: -71.5639 },
  { code: 'NJ', name: 'New Jersey', lat: 40.2989, lng: -74.5210 },
  { code: 'NM', name: 'New Mexico', lat: 34.8405, lng: -106.2485 },
  { code: 'NY', name: 'New York', lat: 40.7128, lng: -74.0060 },
  { code: 'NC', name: 'North Carolina', lat: 35.6301, lng: -79.8064 },
  { code: 'OH', name: 'Ohio', lat: 40.3888, lng: -82.7649 },
  { code: 'OK', name: 'Oklahoma', lat: 35.5653, lng: -96.9289 },
  { code: 'OR', name: 'Oregon', lat: 44.5720, lng: -122.0709 },
  { code: 'PA', name: 'Pennsylvania', lat: 40.5908, lng: -77.2098 },
  { code: 'RI', name: 'Rhode Island', lat: 41.6809, lng: -71.5118 },
  { code: 'SC', name: 'South Carolina', lat: 33.8569, lng: -80.9450 },
  { code: 'SD', name: 'South Dakota', lat: 44.2998, lng: -99.4388 },
  { code: 'TN', name: 'Tennessee', lat: 35.7478, lng: -86.6923 },
  { code: 'TX', name: 'Texas', lat: 31.0545, lng: -97.5635 },
  { code: 'VA', name: 'Virginia', lat: 37.7693, lng: -78.1700 },
  { code: 'WA', name: 'Washington', lat: 47.4009, lng: -121.4905 },
  { code: 'WV', name: 'West Virginia', lat: 38.4912, lng: -80.9545 },
  { code: 'WI', name: 'Wisconsin', lat: 44.2685, lng: -89.6165 },
  { code: 'DC', name: 'Washington DC', lat: 38.9072, lng: -77.0369 },
  { code: 'VT', name: 'Vermont', lat: 44.0459, lng: -72.7107 },
];

export const ALL_LOTTERY_STORES: LotteryStoreData[] = [
  // ========== MICHIGAN ==========
  { id: 'MI-001', name: "Joe's Party Store", address: '12840 Gratiot Ave', city: 'Detroit', state: 'Michigan', stateCode: 'MI', zip: '48205', phone: '(313) 521-8900', rating: 4.3, hours: '7 AM – 11 PM', lat: 42.4195, lng: -82.9805, games: ['Powerball', 'Mega Millions', 'Lotto 47', 'Daily 3', 'Daily 4', 'Fantasy 5'], type: 'convenience' },
  { id: 'MI-002', name: 'Woodward Fuel & Lotto', address: '20501 Woodward Ave', city: 'Detroit', state: 'Michigan', stateCode: 'MI', zip: '48203', phone: '(313) 368-0211', rating: 4.1, hours: '6 AM – 12 AM', lat: 42.4120, lng: -83.1045, games: ['Powerball', 'Mega Millions', 'Lotto 47', 'Daily 3', 'Daily 4'], type: 'gas_station' },
  { id: 'MI-003', name: 'Lucky 7 Market', address: '3345 Michigan Ave', city: 'Detroit', state: 'Michigan', stateCode: 'MI', zip: '48216', phone: '(313) 894-1077', rating: 4.5, hours: '6 AM – 11 PM', lat: 42.3268, lng: -83.0857, games: ['Powerball', 'Mega Millions', 'Lotto 47', 'Daily 3', 'Daily 4', 'Fantasy 5', 'Keno'], type: 'convenience' },
  { id: 'MI-004', name: "Al's Liquor & Wine", address: '6501 Schaefer Hwy', city: 'Dearborn', state: 'Michigan', stateCode: 'MI', zip: '48126', phone: '(313) 582-3300', rating: 4.2, hours: '9 AM – 10 PM', lat: 42.3244, lng: -83.1762, games: ['Powerball', 'Mega Millions', 'Lotto 47', 'Daily 3', 'Daily 4'], type: 'liquor' },
  { id: 'MI-005', name: 'Grand River Quick Stop', address: '15900 Grand River Ave', city: 'Detroit', state: 'Michigan', stateCode: 'MI', zip: '48227', phone: '(313) 836-4500', rating: 3.9, hours: '6 AM – 11 PM', lat: 42.3930, lng: -83.1695, games: ['Powerball', 'Mega Millions', 'Lotto 47', 'Daily 3', 'Daily 4', 'Fantasy 5'], type: 'convenience' },
  { id: 'MI-006', name: 'Motor City Lotto Hub', address: '2780 E Jefferson Ave', city: 'Detroit', state: 'Michigan', stateCode: 'MI', zip: '48207', phone: '(313) 259-7700', rating: 4.6, hours: '7 AM – 10 PM', lat: 42.3393, lng: -83.0213, games: ['Powerball', 'Mega Millions', 'Lotto 47', 'Daily 3', 'Daily 4', 'Fantasy 5', 'Keno', 'Lucky For Life'], type: 'convenience' },
  { id: 'MI-007', name: 'Meijer – Ann Arbor', address: '3145 Ann Arbor-Saline Rd', city: 'Ann Arbor', state: 'Michigan', stateCode: 'MI', zip: '48103', phone: '(734) 327-0300', rating: 4.4, hours: '6 AM – 12 AM', lat: 42.2385, lng: -83.7653, games: ['Powerball', 'Mega Millions', 'Lotto 47', 'Daily 3', 'Daily 4', 'Fantasy 5'], type: 'grocery' },
  { id: 'MI-008', name: 'Kroger – Lansing', address: '6430 W Saginaw Hwy', city: 'Lansing', state: 'Michigan', stateCode: 'MI', zip: '48917', phone: '(517) 323-9060', rating: 4.3, hours: '6 AM – 11 PM', lat: 42.7410, lng: -84.6350, games: ['Powerball', 'Mega Millions', 'Lotto 47', 'Daily 3', 'Daily 4'], type: 'grocery' },
  { id: 'MI-009', name: "Champ's Party Store", address: '4101 S Division Ave', city: 'Grand Rapids', state: 'Michigan', stateCode: 'MI', zip: '49548', phone: '(616) 534-8812', rating: 4.0, hours: '8 AM – 10 PM', lat: 42.9125, lng: -85.6660, games: ['Powerball', 'Mega Millions', 'Lotto 47', 'Daily 3', 'Daily 4', 'Fantasy 5'], type: 'convenience' },
  { id: 'MI-010', name: 'Speedway – Flint', address: '3401 S Dort Hwy', city: 'Flint', state: 'Michigan', stateCode: 'MI', zip: '48507', phone: '(810) 744-2090', rating: 3.8, hours: '24 Hours', lat: 42.9476, lng: -83.6882, games: ['Powerball', 'Mega Millions', 'Lotto 47', 'Daily 3', 'Daily 4'], type: 'gas_station' },
  { id: 'MI-011', name: "Sam's Lotto & Tobacco", address: '1205 S University Ave', city: 'Ann Arbor', state: 'Michigan', stateCode: 'MI', zip: '48104', phone: '(734) 663-1020', rating: 4.5, hours: '8 AM – 10 PM', lat: 42.2726, lng: -83.7395, games: ['Powerball', 'Mega Millions', 'Lotto 47', 'Daily 3', 'Daily 4', 'Keno'], type: 'smoke_shop' },
  { id: 'MI-012', name: 'Meijer – Troy', address: '3175 John R Rd', city: 'Troy', state: 'Michigan', stateCode: 'MI', zip: '48083', phone: '(248) 588-1234', rating: 4.4, hours: '6 AM – 12 AM', lat: 42.5612, lng: -83.1157, games: ['Powerball', 'Mega Millions', 'Lotto 47', 'Daily 3', 'Daily 4', 'Fantasy 5'], type: 'grocery' },
  { id: 'MI-013', name: 'BP – Kalamazoo', address: '3510 Stadium Dr', city: 'Kalamazoo', state: 'Michigan', stateCode: 'MI', zip: '49008', phone: '(269) 375-1122', rating: 3.7, hours: '5 AM – 11 PM', lat: 42.2748, lng: -85.6267, games: ['Powerball', 'Mega Millions', 'Lotto 47', 'Daily 3'], type: 'gas_station' },
  { id: 'MI-014', name: 'Dollar General – Saginaw', address: '5185 State St', city: 'Saginaw', state: 'Michigan', stateCode: 'MI', zip: '48603', phone: '(989) 799-3300', rating: 3.6, hours: '8 AM – 10 PM', lat: 43.4301, lng: -84.0054, games: ['Powerball', 'Mega Millions', 'Daily 3', 'Daily 4'], type: 'convenience' },
  { id: 'MI-015', name: 'Marathon – Warren', address: '8200 E 8 Mile Rd', city: 'Warren', state: 'Michigan', stateCode: 'MI', zip: '48089', phone: '(586) 754-0011', rating: 4.1, hours: '24 Hours', lat: 42.4468, lng: -83.0133, games: ['Powerball', 'Mega Millions', 'Lotto 47', 'Daily 3', 'Daily 4', 'Fantasy 5'], type: 'gas_station' },

  // ========== NEW YORK ==========
  { id: 'NY-001', name: "Mike's Deli & Lotto", address: '1425 Broadway', city: 'New York', state: 'New York', stateCode: 'NY', zip: '10018', phone: '(212) 555-0142', rating: 4.5, hours: '6 AM – 11 PM', lat: 40.7536, lng: -73.9862, games: ['Powerball', 'Mega Millions', 'Pick 3', 'Pick 4', 'Cash4Life'], type: 'newsstand' },
  { id: 'NY-002', name: 'Lucky Corner News', address: '789 8th Avenue', city: 'New York', state: 'New York', stateCode: 'NY', zip: '10036', phone: '(212) 555-0287', rating: 4.2, hours: '5 AM – 12 AM', lat: 40.7589, lng: -73.9851, games: ['Powerball', 'Mega Millions', 'Pick 3', 'Pick 4', 'Cash4Life', 'Lotto'], type: 'newsstand' },
  { id: 'NY-003', name: "Tony's Quick Mart", address: '302 W 42nd St', city: 'New York', state: 'New York', stateCode: 'NY', zip: '10036', phone: '(212) 555-0319', rating: 4.0, hours: '7 AM – 10 PM', lat: 40.7573, lng: -73.9903, games: ['Powerball', 'Mega Millions', 'Pick 3'], type: 'convenience' },
  { id: 'NY-004', name: 'Empire State Convenience', address: '15 W 34th St', city: 'New York', state: 'New York', stateCode: 'NY', zip: '10001', phone: '(212) 555-0456', rating: 4.7, hours: '24 Hours', lat: 40.7484, lng: -73.9856, games: ['Powerball', 'Mega Millions', 'Pick 3', 'Pick 4', 'Cash4Life', 'Lotto'], type: 'convenience' },
  { id: 'NY-005', name: 'Brooklyn Lotto Center', address: '456 Flatbush Ave', city: 'Brooklyn', state: 'New York', stateCode: 'NY', zip: '11225', phone: '(718) 555-0678', rating: 4.3, hours: '7 AM – 11 PM', lat: 40.6601, lng: -73.9619, games: ['Powerball', 'Mega Millions', 'Pick 3', 'Pick 4'], type: 'convenience' },
  { id: 'NY-006', name: 'Bronx Superette', address: '3200 Grand Concourse', city: 'Bronx', state: 'New York', stateCode: 'NY', zip: '10458', phone: '(718) 555-0891', rating: 3.9, hours: '6 AM – 10 PM', lat: 40.8606, lng: -73.8977, games: ['Powerball', 'Mega Millions', 'Pick 3', 'Pick 4', 'Lotto'], type: 'convenience' },
  { id: 'NY-007', name: 'Queens Deli & Lottery', address: '7101 Roosevelt Ave', city: 'Queens', state: 'New York', stateCode: 'NY', zip: '11372', phone: '(718) 555-0234', rating: 4.1, hours: '6 AM – 11 PM', lat: 40.7506, lng: -73.8838, games: ['Powerball', 'Mega Millions', 'Pick 3', 'Pick 4'], type: 'convenience' },
  { id: 'NY-008', name: "Mario's Smoke Shop – Buffalo", address: '1240 Main St', city: 'Buffalo', state: 'New York', stateCode: 'NY', zip: '14209', phone: '(716) 555-0345', rating: 4.4, hours: '8 AM – 10 PM', lat: 42.9145, lng: -78.8675, games: ['Powerball', 'Mega Millions', 'Pick 3', 'Pick 4', 'Cash4Life'], type: 'smoke_shop' },

  // ========== TEXAS ==========
  { id: 'TX-001', name: 'Lone Star Fuel & Lotto', address: '4510 Gaston Ave', city: 'Dallas', state: 'Texas', stateCode: 'TX', zip: '75246', phone: '(214) 823-4455', rating: 4.2, hours: '24 Hours', lat: 32.7985, lng: -96.7700, games: ['Powerball', 'Mega Millions', 'Lotto Texas', 'Pick 3', 'Daily 4', 'Cash Five'], type: 'gas_station' },
  { id: 'TX-002', name: 'H-E-B – Houston Heights', address: '2300 N Shepherd Dr', city: 'Houston', state: 'Texas', stateCode: 'TX', zip: '77008', phone: '(713) 862-7070', rating: 4.7, hours: '6 AM – 11 PM', lat: 29.8016, lng: -95.4102, games: ['Powerball', 'Mega Millions', 'Lotto Texas', 'Pick 3', 'Daily 4', 'Cash Five', 'Texas Two Step'], type: 'grocery' },
  { id: 'TX-003', name: 'ValerO – San Antonio', address: '3901 Fredericksburg Rd', city: 'San Antonio', state: 'Texas', stateCode: 'TX', zip: '78201', phone: '(210) 736-1212', rating: 4.0, hours: '5 AM – 12 AM', lat: 29.4683, lng: -98.5200, games: ['Powerball', 'Mega Millions', 'Lotto Texas', 'Pick 3', 'Daily 4'], type: 'gas_station' },
  { id: 'TX-004', name: 'Buc-ee\'s – Temple', address: '4155 N General Bruce Dr', city: 'Temple', state: 'Texas', stateCode: 'TX', zip: '76501', phone: '(254) 231-0901', rating: 4.8, hours: '24 Hours', lat: 31.1245, lng: -97.3780, games: ['Powerball', 'Mega Millions', 'Lotto Texas', 'Pick 3', 'Daily 4', 'Cash Five'], type: 'gas_station' },
  { id: 'TX-005', name: "Tiger Mart – Austin", address: '5500 S Congress Ave', city: 'Austin', state: 'Texas', stateCode: 'TX', zip: '78745', phone: '(512) 444-6677', rating: 4.1, hours: '24 Hours', lat: 30.2200, lng: -97.7892, games: ['Powerball', 'Mega Millions', 'Lotto Texas', 'Pick 3', 'Daily 4'], type: 'gas_station' },
  { id: 'TX-006', name: 'Quick Trip – Fort Worth', address: '2800 W 7th St', city: 'Fort Worth', state: 'Texas', stateCode: 'TX', zip: '76107', phone: '(817) 335-9090', rating: 4.3, hours: '24 Hours', lat: 32.7481, lng: -97.3580, games: ['Powerball', 'Mega Millions', 'Lotto Texas', 'Pick 3', 'Daily 4', 'Cash Five'], type: 'gas_station' },
  { id: 'TX-007', name: 'Corner Store – El Paso', address: '6900 N Mesa St', city: 'El Paso', state: 'Texas', stateCode: 'TX', zip: '79912', phone: '(915) 581-4421', rating: 3.8, hours: '6 AM – 11 PM', lat: 31.8216, lng: -106.5639, games: ['Powerball', 'Mega Millions', 'Lotto Texas', 'Pick 3'], type: 'convenience' },

  // ========== CALIFORNIA ==========
  { id: 'CA-001', name: 'Hollywood Quick Stop', address: '6543 Hollywood Blvd', city: 'Los Angeles', state: 'California', stateCode: 'CA', zip: '90028', phone: '(323) 462-1234', rating: 4.1, hours: '6 AM – 12 AM', lat: 34.1017, lng: -118.3274, games: ['Powerball', 'Mega Millions', 'SuperLotto Plus', 'Fantasy 5', 'Daily 3', 'Daily 4'], type: 'convenience' },
  { id: 'CA-002', name: 'Golden Gate Liquor', address: '1390 Market St', city: 'San Francisco', state: 'California', stateCode: 'CA', zip: '94102', phone: '(415) 626-7890', rating: 4.3, hours: '8 AM – 11 PM', lat: 37.7764, lng: -122.4170, games: ['Powerball', 'Mega Millions', 'SuperLotto Plus', 'Fantasy 5', 'Daily 3'], type: 'liquor' },
  { id: 'CA-003', name: 'Palm Desert Mart', address: '44200 Town Center Way', city: 'Palm Desert', state: 'California', stateCode: 'CA', zip: '92260', phone: '(760) 346-2345', rating: 4.5, hours: '7 AM – 10 PM', lat: 33.7224, lng: -116.3735, games: ['Powerball', 'Mega Millions', 'SuperLotto Plus', 'Fantasy 5'], type: 'convenience' },
  { id: 'CA-004', name: '7-Eleven – San Diego', address: '3502 El Cajon Blvd', city: 'San Diego', state: 'California', stateCode: 'CA', zip: '92104', phone: '(619) 283-0088', rating: 3.9, hours: '24 Hours', lat: 32.7574, lng: -117.1259, games: ['Powerball', 'Mega Millions', 'SuperLotto Plus', 'Fantasy 5', 'Daily 3', 'Daily 4'], type: 'convenience' },
  { id: 'CA-005', name: "Safeway – Sacramento", address: '1620 W El Camino Ave', city: 'Sacramento', state: 'California', stateCode: 'CA', zip: '95815', phone: '(916) 920-2345', rating: 4.2, hours: '6 AM – 11 PM', lat: 38.6076, lng: -121.4980, games: ['Powerball', 'Mega Millions', 'SuperLotto Plus', 'Fantasy 5', 'Daily 3'], type: 'grocery' },
  { id: 'CA-006', name: 'Chevron – Fresno', address: '4850 N Blackstone Ave', city: 'Fresno', state: 'California', stateCode: 'CA', zip: '93726', phone: '(559) 224-5678', rating: 3.8, hours: '5 AM – 12 AM', lat: 36.7893, lng: -119.7917, games: ['Powerball', 'Mega Millions', 'SuperLotto Plus', 'Daily 3'], type: 'gas_station' },

  // ========== FLORIDA ==========
  { id: 'FL-001', name: 'Sunshine Lotto Center', address: '3850 W Flagler St', city: 'Miami', state: 'Florida', stateCode: 'FL', zip: '33134', phone: '(305) 445-2233', rating: 4.4, hours: '7 AM – 11 PM', lat: 25.7657, lng: -80.2491, games: ['Powerball', 'Mega Millions', 'Florida Lotto', 'Pick 3', 'Pick 4', 'Cash4Life', 'Fantasy 5'], type: 'convenience' },
  { id: 'FL-002', name: 'Publix – Orlando', address: '8255 International Dr', city: 'Orlando', state: 'Florida', stateCode: 'FL', zip: '32819', phone: '(407) 352-7676', rating: 4.6, hours: '7 AM – 10 PM', lat: 28.4406, lng: -81.4717, games: ['Powerball', 'Mega Millions', 'Florida Lotto', 'Pick 3', 'Pick 4', 'Fantasy 5'], type: 'grocery' },
  { id: 'FL-003', name: 'Shell – Tampa', address: '4301 W Kennedy Blvd', city: 'Tampa', state: 'Florida', stateCode: 'FL', zip: '33609', phone: '(813) 286-1100', rating: 4.0, hours: '24 Hours', lat: 27.9463, lng: -82.5060, games: ['Powerball', 'Mega Millions', 'Florida Lotto', 'Pick 3', 'Pick 4'], type: 'gas_station' },
  { id: 'FL-004', name: 'Wawa – Jacksonville', address: '9700 Beach Blvd', city: 'Jacksonville', state: 'Florida', stateCode: 'FL', zip: '32246', phone: '(904) 645-0088', rating: 4.3, hours: '24 Hours', lat: 30.2924, lng: -81.5398, games: ['Powerball', 'Mega Millions', 'Florida Lotto', 'Pick 3', 'Pick 4', 'Fantasy 5'], type: 'gas_station' },
  { id: 'FL-005', name: 'Lucky Mart – Fort Lauderdale', address: '2200 E Sunrise Blvd', city: 'Fort Lauderdale', state: 'Florida', stateCode: 'FL', zip: '33304', phone: '(954) 564-3300', rating: 4.2, hours: '6 AM – 11 PM', lat: 26.1368, lng: -80.1192, games: ['Powerball', 'Mega Millions', 'Florida Lotto', 'Pick 3', 'Pick 4', 'Cash4Life'], type: 'convenience' },

  // ========== ILLINOIS ==========
  { id: 'IL-001', name: 'Windy City Lotto', address: '3501 N Clark St', city: 'Chicago', state: 'Illinois', stateCode: 'IL', zip: '60657', phone: '(773) 404-2233', rating: 4.4, hours: '6 AM – 12 AM', lat: 41.9462, lng: -87.6544, games: ['Powerball', 'Mega Millions', 'Lotto', 'Pick 3', 'Pick 4', 'Lucky Day Lotto'], type: 'convenience' },
  { id: 'IL-002', name: '7-Eleven – Chicago Loop', address: '200 S Wacker Dr', city: 'Chicago', state: 'Illinois', stateCode: 'IL', zip: '60606', phone: '(312) 876-0011', rating: 4.0, hours: '24 Hours', lat: 41.8788, lng: -87.6369, games: ['Powerball', 'Mega Millions', 'Lotto', 'Pick 3', 'Pick 4'], type: 'convenience' },
  { id: 'IL-003', name: 'BP – Springfield', address: '2100 S MacArthur Blvd', city: 'Springfield', state: 'Illinois', stateCode: 'IL', zip: '62704', phone: '(217) 544-8899', rating: 3.9, hours: '5 AM – 11 PM', lat: 39.7739, lng: -89.6870, games: ['Powerball', 'Mega Millions', 'Lotto', 'Pick 3', 'Pick 4'], type: 'gas_station' },
  { id: 'IL-004', name: 'South Side Mart', address: '7800 S Halsted St', city: 'Chicago', state: 'Illinois', stateCode: 'IL', zip: '60620', phone: '(773) 651-2244', rating: 4.2, hours: '7 AM – 10 PM', lat: 41.7528, lng: -87.6437, games: ['Powerball', 'Mega Millions', 'Lotto', 'Pick 3', 'Pick 4', 'Lucky Day Lotto'], type: 'convenience' },

  // ========== PENNSYLVANIA ==========
  { id: 'PA-001', name: 'Philly Lotto Express', address: '1021 Market St', city: 'Philadelphia', state: 'Pennsylvania', stateCode: 'PA', zip: '19107', phone: '(215) 922-0033', rating: 4.3, hours: '6 AM – 11 PM', lat: 39.9528, lng: -75.1581, games: ['Powerball', 'Mega Millions', 'Cash 5', 'Pick 2', 'Pick 3', 'Pick 4', 'Match 6'], type: 'newsstand' },
  { id: 'PA-002', name: 'Sheetz – Pittsburgh', address: '5700 Forbes Ave', city: 'Pittsburgh', state: 'Pennsylvania', stateCode: 'PA', zip: '15217', phone: '(412) 422-7788', rating: 4.5, hours: '24 Hours', lat: 40.4313, lng: -79.9236, games: ['Powerball', 'Mega Millions', 'Cash 5', 'Pick 3', 'Pick 4'], type: 'gas_station' },
  { id: 'PA-003', name: 'Wawa – Allentown', address: '1510 W Hamilton St', city: 'Allentown', state: 'Pennsylvania', stateCode: 'PA', zip: '18102', phone: '(610) 433-5566', rating: 4.4, hours: '24 Hours', lat: 40.6060, lng: -75.4822, games: ['Powerball', 'Mega Millions', 'Cash 5', 'Pick 3', 'Pick 4', 'Match 6'], type: 'gas_station' },

  // ========== OHIO ==========
  { id: 'OH-001', name: 'Buckeye Lotto Stop', address: '4500 Prospect Ave', city: 'Cleveland', state: 'Ohio', stateCode: 'OH', zip: '44103', phone: '(216) 431-9900', rating: 4.2, hours: '7 AM – 11 PM', lat: 41.5018, lng: -81.6603, games: ['Powerball', 'Mega Millions', 'Classic Lotto', 'Pick 3', 'Pick 4', 'Rolling Cash 5'], type: 'convenience' },
  { id: 'OH-002', name: 'Speedway – Columbus', address: '2890 N High St', city: 'Columbus', state: 'Ohio', stateCode: 'OH', zip: '43202', phone: '(614) 267-3344', rating: 4.0, hours: '24 Hours', lat: 40.0190, lng: -83.0087, games: ['Powerball', 'Mega Millions', 'Classic Lotto', 'Pick 3', 'Pick 4'], type: 'gas_station' },
  { id: 'OH-003', name: 'UDF – Cincinnati', address: '3450 Reading Rd', city: 'Cincinnati', state: 'Ohio', stateCode: 'OH', zip: '45229', phone: '(513) 281-5500', rating: 4.3, hours: '6 AM – 11 PM', lat: 39.1544, lng: -84.4866, games: ['Powerball', 'Mega Millions', 'Classic Lotto', 'Pick 3', 'Pick 4', 'Rolling Cash 5'], type: 'convenience' },

  // ========== GEORGIA ==========
  { id: 'GA-001', name: 'Peachtree Lotto Mart', address: '2450 Peachtree Rd NE', city: 'Atlanta', state: 'Georgia', stateCode: 'GA', zip: '30305', phone: '(404) 261-8800', rating: 4.5, hours: '6 AM – 12 AM', lat: 33.8432, lng: -84.3803, games: ['Powerball', 'Mega Millions', 'Georgia Lottery', 'Cash 3', 'Cash 4', 'Fantasy 5'], type: 'convenience' },
  { id: 'GA-002', name: 'QT – Savannah', address: '5300 Abercorn St', city: 'Savannah', state: 'Georgia', stateCode: 'GA', zip: '31405', phone: '(912) 354-6677', rating: 4.3, hours: '24 Hours', lat: 32.0129, lng: -81.1044, games: ['Powerball', 'Mega Millions', 'Cash 3', 'Cash 4', 'Fantasy 5'], type: 'gas_station' },
  { id: 'GA-003', name: 'Kroger – Augusta', address: '3120 Washington Rd', city: 'Augusta', state: 'Georgia', stateCode: 'GA', zip: '30907', phone: '(706) 860-2244', rating: 4.1, hours: '6 AM – 11 PM', lat: 33.5112, lng: -82.0608, games: ['Powerball', 'Mega Millions', 'Cash 3', 'Cash 4'], type: 'grocery' },

  // ========== NEW JERSEY ==========
  { id: 'NJ-001', name: 'Jersey Jackpot News', address: '102 Broad St', city: 'Newark', state: 'New Jersey', stateCode: 'NJ', zip: '07102', phone: '(973) 624-5566', rating: 4.0, hours: '6 AM – 10 PM', lat: 40.7357, lng: -74.1724, games: ['Powerball', 'Mega Millions', 'Pick 3', 'Pick 4', 'Cash4Life', 'Jersey Cash 5'], type: 'newsstand' },
  { id: 'NJ-002', name: 'Wawa – Cherry Hill', address: '1501 Kings Hwy N', city: 'Cherry Hill', state: 'New Jersey', stateCode: 'NJ', zip: '08034', phone: '(856) 428-9900', rating: 4.5, hours: '24 Hours', lat: 39.9393, lng: -75.0038, games: ['Powerball', 'Mega Millions', 'Pick 3', 'Pick 4', 'Cash4Life'], type: 'gas_station' },
  { id: 'NJ-003', name: "Tony's Smoke Shop – Hoboken", address: '326 Washington St', city: 'Hoboken', state: 'New Jersey', stateCode: 'NJ', zip: '07030', phone: '(201) 659-1122', rating: 4.3, hours: '7 AM – 10 PM', lat: 40.7426, lng: -74.0301, games: ['Powerball', 'Mega Millions', 'Pick 3', 'Pick 4', 'Jersey Cash 5'], type: 'smoke_shop' },

  // ========== NORTH CAROLINA ==========
  { id: 'NC-001', name: 'Circle K – Charlotte', address: '3700 S Tryon St', city: 'Charlotte', state: 'North Carolina', stateCode: 'NC', zip: '28217', phone: '(704) 525-3344', rating: 4.1, hours: '24 Hours', lat: 35.1868, lng: -80.8662, games: ['Powerball', 'Mega Millions', 'Cash 5', 'Pick 3', 'Pick 4', 'Lucky For Life'], type: 'gas_station' },
  { id: 'NC-002', name: 'Harris Teeter – Raleigh', address: '2820 Hillsborough St', city: 'Raleigh', state: 'North Carolina', stateCode: 'NC', zip: '27607', phone: '(919) 821-5500', rating: 4.4, hours: '6 AM – 11 PM', lat: 35.7856, lng: -78.6753, games: ['Powerball', 'Mega Millions', 'Cash 5', 'Pick 3', 'Pick 4'], type: 'grocery' },

  // ========== VIRGINIA ==========
  { id: 'VA-001', name: 'Sheetz – Richmond', address: '5100 W Broad St', city: 'Richmond', state: 'Virginia', stateCode: 'VA', zip: '23230', phone: '(804) 288-0077', rating: 4.4, hours: '24 Hours', lat: 37.5779, lng: -77.4953, games: ['Powerball', 'Mega Millions', 'Cash 5', 'Pick 3', 'Pick 4', 'Cash4Life'], type: 'gas_station' },
  { id: 'VA-002', name: 'Lucky Mart – Virginia Beach', address: '3200 Virginia Beach Blvd', city: 'Virginia Beach', state: 'Virginia', stateCode: 'VA', zip: '23452', phone: '(757) 340-5566', rating: 4.2, hours: '6 AM – 11 PM', lat: 36.8448, lng: -76.0791, games: ['Powerball', 'Mega Millions', 'Cash 5', 'Pick 3', 'Pick 4'], type: 'convenience' },

  // ========== MASSACHUSETTS ==========
  { id: 'MA-001', name: "Sullivan's Corner Store", address: '120 Tremont St', city: 'Boston', state: 'Massachusetts', stateCode: 'MA', zip: '02108', phone: '(617) 523-4455', rating: 4.6, hours: '6 AM – 10 PM', lat: 42.3563, lng: -71.0621, games: ['Powerball', 'Mega Millions', 'Mass Cash', 'Numbers Game', 'Megabucks'], type: 'convenience' },
  { id: 'MA-002', name: 'Tedeschi – Worcester', address: '280 Main St', city: 'Worcester', state: 'Massachusetts', stateCode: 'MA', zip: '01608', phone: '(508) 755-2233', rating: 4.1, hours: '5 AM – 11 PM', lat: 42.2620, lng: -71.8011, games: ['Powerball', 'Mega Millions', 'Mass Cash', 'Numbers Game'], type: 'convenience' },

  // ========== INDIANA ==========
  { id: 'IN-001', name: 'Circle K – Indianapolis', address: '4501 E Washington St', city: 'Indianapolis', state: 'Indiana', stateCode: 'IN', zip: '46201', phone: '(317) 353-9900', rating: 4.0, hours: '24 Hours', lat: 39.7684, lng: -86.0981, games: ['Powerball', 'Mega Millions', 'Hoosier Lotto', 'Daily 3', 'Daily 4', 'Cash 5'], type: 'gas_station' },
  { id: 'IN-002', name: 'Meijer – Fort Wayne', address: '6310 Illinois Rd', city: 'Fort Wayne', state: 'Indiana', stateCode: 'IN', zip: '46804', phone: '(260) 432-7788', rating: 4.3, hours: '6 AM – 12 AM', lat: 41.0598, lng: -85.2188, games: ['Powerball', 'Mega Millions', 'Hoosier Lotto', 'Daily 3', 'Daily 4'], type: 'grocery' },

  // ========== LOUISIANA ==========
  { id: 'LA-001', name: 'Bayou Lotto & Spirits', address: '3100 Magazine St', city: 'New Orleans', state: 'Louisiana', stateCode: 'LA', zip: '70115', phone: '(504) 897-2233', rating: 4.5, hours: '8 AM – 12 AM', lat: 29.9252, lng: -90.0922, games: ['Powerball', 'Mega Millions', 'Lotto', 'Pick 3', 'Pick 4', 'Easy 5'], type: 'liquor' },
  { id: 'LA-002', name: 'Tiger Mart – Baton Rouge', address: '5100 Highland Rd', city: 'Baton Rouge', state: 'Louisiana', stateCode: 'LA', zip: '70808', phone: '(225) 766-4455', rating: 4.2, hours: '24 Hours', lat: 30.4100, lng: -91.1460, games: ['Powerball', 'Mega Millions', 'Lotto', 'Pick 3', 'Pick 4'], type: 'gas_station' },

  // ========== MARYLAND ==========
  { id: 'MD-001', name: 'Royal Farms – Baltimore', address: '3500 E Monument St', city: 'Baltimore', state: 'Maryland', stateCode: 'MD', zip: '21205', phone: '(410) 276-8800', rating: 4.1, hours: '24 Hours', lat: 39.2988, lng: -76.5828, games: ['Powerball', 'Mega Millions', 'Multi-Match', 'Pick 3', 'Pick 4', 'Bonus Match 5'], type: 'gas_station' },

  // ========== COLORADO ==========
  { id: 'CO-001', name: 'King Soopers – Denver', address: '2750 S Colorado Blvd', city: 'Denver', state: 'Colorado', stateCode: 'CO', zip: '80222', phone: '(303) 691-0088', rating: 4.4, hours: '5 AM – 12 AM', lat: 39.6735, lng: -104.9410, games: ['Powerball', 'Mega Millions', 'Colorado Lotto+', 'Pick 3', 'Cash 5', 'Lucky For Life'], type: 'grocery' },
  { id: 'CO-002', name: '7-Eleven – Colorado Springs', address: '3460 N Academy Blvd', city: 'Colorado Springs', state: 'Colorado', stateCode: 'CO', zip: '80917', phone: '(719) 597-3344', rating: 3.9, hours: '24 Hours', lat: 38.8750, lng: -104.7551, games: ['Powerball', 'Mega Millions', 'Colorado Lotto+', 'Pick 3'], type: 'convenience' },

  // ========== WASHINGTON ==========
  { id: 'WA-001', name: 'QFC – Seattle', address: '500 Mercer St', city: 'Seattle', state: 'Washington', stateCode: 'WA', zip: '98109', phone: '(206) 623-7788', rating: 4.3, hours: '6 AM – 11 PM', lat: 47.6245, lng: -122.3469, games: ['Powerball', 'Mega Millions', 'Lotto', 'Hit 5', 'Match 4', 'Pick 3'], type: 'grocery' },
  { id: 'WA-002', name: 'Chevron – Tacoma', address: '3810 Pacific Ave', city: 'Tacoma', state: 'Washington', stateCode: 'WA', zip: '98418', phone: '(253) 474-2211', rating: 4.0, hours: '5 AM – 12 AM', lat: 47.2215, lng: -122.4558, games: ['Powerball', 'Mega Millions', 'Lotto', 'Hit 5', 'Pick 3'], type: 'gas_station' },

  // ========== ARIZONA ==========
  { id: 'AZ-001', name: 'Circle K – Phoenix', address: '4302 E Indian School Rd', city: 'Phoenix', state: 'Arizona', stateCode: 'AZ', zip: '85018', phone: '(480) 945-0088', rating: 4.1, hours: '24 Hours', lat: 33.4944, lng: -111.9876, games: ['Powerball', 'Mega Millions', 'The Pick', 'Pick 3', 'Fantasy 5', 'Triple Twist'], type: 'gas_station' },
  { id: 'AZ-002', name: 'QuikTrip – Tucson', address: '5300 E Speedway Blvd', city: 'Tucson', state: 'Arizona', stateCode: 'AZ', zip: '85712', phone: '(520) 296-5566', rating: 4.2, hours: '24 Hours', lat: 32.2362, lng: -110.8868, games: ['Powerball', 'Mega Millions', 'The Pick', 'Pick 3', 'Fantasy 5'], type: 'gas_station' },

  // ========== TENNESSEE ==========
  { id: 'TN-001', name: 'Mapco – Nashville', address: '2100 West End Ave', city: 'Nashville', state: 'Tennessee', stateCode: 'TN', zip: '37203', phone: '(615) 329-0011', rating: 4.2, hours: '24 Hours', lat: 36.1500, lng: -86.8048, games: ['Powerball', 'Mega Millions', 'Cash 3', 'Cash 4', 'Tennessee Cash', 'Lotto America'], type: 'gas_station' },
  { id: 'TN-002', name: 'Pilot – Memphis', address: '4680 Elvis Presley Blvd', city: 'Memphis', state: 'Tennessee', stateCode: 'TN', zip: '38116', phone: '(901) 332-5566', rating: 4.0, hours: '24 Hours', lat: 35.0538, lng: -90.0278, games: ['Powerball', 'Mega Millions', 'Cash 3', 'Cash 4', 'Tennessee Cash'], type: 'gas_station' },

  // ========== MISSOURI ==========
  { id: 'MO-001', name: 'QuikTrip – Kansas City', address: '4700 Main St', city: 'Kansas City', state: 'Missouri', stateCode: 'MO', zip: '64112', phone: '(816) 753-2211', rating: 4.3, hours: '24 Hours', lat: 39.0413, lng: -94.5826, games: ['Powerball', 'Mega Millions', 'Show Me Cash', 'Pick 3', 'Pick 4', 'Lotto'], type: 'gas_station' },
  { id: 'MO-002', name: 'Schnucks – St. Louis', address: '3430 S Grand Blvd', city: 'St. Louis', state: 'Missouri', stateCode: 'MO', zip: '63118', phone: '(314) 772-0088', rating: 4.4, hours: '6 AM – 10 PM', lat: 38.5973, lng: -90.2397, games: ['Powerball', 'Mega Millions', 'Show Me Cash', 'Pick 3', 'Pick 4'], type: 'grocery' },

  // ========== MINNESOTA ==========
  { id: 'MN-001', name: 'Holiday – Minneapolis', address: '3000 Hennepin Ave', city: 'Minneapolis', state: 'Minnesota', stateCode: 'MN', zip: '55408', phone: '(612) 824-4455', rating: 4.2, hours: '24 Hours', lat: 44.9562, lng: -93.2972, games: ['Powerball', 'Mega Millions', 'Gopher 5', 'Northstar Cash', 'Daily 3'], type: 'gas_station' },

  // ========== WISCONSIN ==========
  { id: 'WI-001', name: 'Kwik Trip – Milwaukee', address: '4200 S Howell Ave', city: 'Milwaukee', state: 'Wisconsin', stateCode: 'WI', zip: '53207', phone: '(414) 483-2211', rating: 4.5, hours: '24 Hours', lat: 42.9644, lng: -87.9074, games: ['Powerball', 'Mega Millions', 'SuperCash!', 'Badger 5', 'Pick 3', 'Pick 4'], type: 'gas_station' },

  // ========== SOUTH CAROLINA ==========
  { id: 'SC-001', name: 'Spinx – Greenville', address: '1801 Augusta St', city: 'Greenville', state: 'South Carolina', stateCode: 'SC', zip: '29605', phone: '(864) 233-0011', rating: 4.1, hours: '24 Hours', lat: 34.8309, lng: -82.4077, games: ['Powerball', 'Mega Millions', 'Pick 3', 'Pick 4', 'Palmetto Cash 5'], type: 'gas_station' },

  // ========== KENTUCKY ==========
  { id: 'KY-001', name: 'Thorntons – Louisville', address: '3901 Bardstown Rd', city: 'Louisville', state: 'Kentucky', stateCode: 'KY', zip: '40218', phone: '(502) 456-0088', rating: 4.2, hours: '24 Hours', lat: 38.2012, lng: -85.6813, games: ['Powerball', 'Mega Millions', 'Cash Ball', 'Pick 3', 'Pick 4', '5 Card Cash'], type: 'gas_station' },

  // ========== CONNECTICUT ==========
  { id: 'CT-001', name: 'Cumberland Farms – Hartford', address: '500 Main St', city: 'Hartford', state: 'Connecticut', stateCode: 'CT', zip: '06103', phone: '(860) 527-3344', rating: 4.0, hours: '24 Hours', lat: 41.7658, lng: -72.6734, games: ['Powerball', 'Mega Millions', 'Lotto!', 'Play 3', 'Play 4', 'Cash5', 'Lucky For Life'], type: 'gas_station' },

  // ========== OREGON ==========
  { id: 'OR-001', name: 'Plaid Pantry – Portland', address: '2405 SE Hawthorne Blvd', city: 'Portland', state: 'Oregon', stateCode: 'OR', zip: '97214', phone: '(503) 233-0011', rating: 4.3, hours: '24 Hours', lat: 45.5123, lng: -122.6387, games: ['Powerball', 'Mega Millions', 'Oregon Megabucks', 'Pick 4', 'Win For Life'], type: 'convenience' },

  // ========== IOWA ==========
  { id: 'IA-001', name: 'Kum & Go – Des Moines', address: '3500 Ingersoll Ave', city: 'Des Moines', state: 'Iowa', stateCode: 'IA', zip: '50312', phone: '(515) 279-0088', rating: 4.2, hours: '24 Hours', lat: 41.5845, lng: -93.6754, games: ['Powerball', 'Mega Millions', 'Lotto America', 'Pick 3', 'Pick 4', 'Lucky For Life'], type: 'gas_station' },

  // ========== KANSAS ==========
  { id: 'KS-001', name: 'QuikTrip – Wichita', address: '2700 N Rock Rd', city: 'Wichita', state: 'Kansas', stateCode: 'KS', zip: '67226', phone: '(316) 636-2211', rating: 4.1, hours: '24 Hours', lat: 37.7114, lng: -97.2537, games: ['Powerball', 'Mega Millions', 'Super Kansas Cash', 'Pick 3', '2by2'], type: 'gas_station' },

  // ========== ARKANSAS ==========
  { id: 'AR-001', name: "Murphy's – Little Rock", address: '10800 Rodney Parham Rd', city: 'Little Rock', state: 'Arkansas', stateCode: 'AR', zip: '72212', phone: '(501) 225-0011', rating: 4.0, hours: '6 AM – 10 PM', lat: 34.7532, lng: -92.3888, games: ['Powerball', 'Mega Millions', 'Natural State Jackpot', 'Cash 3', 'Cash 4', 'Lucky For Life'], type: 'gas_station' },

  // ========== OKLAHOMA ==========
  { id: 'OK-001', name: 'OnCue – Oklahoma City', address: '5901 N May Ave', city: 'Oklahoma City', state: 'Oklahoma', stateCode: 'OK', zip: '73112', phone: '(405) 848-5566', rating: 4.3, hours: '24 Hours', lat: 35.5275, lng: -97.5644, games: ['Powerball', 'Mega Millions', 'Cash 5', 'Pick 3', 'Lucky For Life'], type: 'gas_station' },

  // ========== NEBRASKA ==========
  { id: 'NE-001', name: 'Bakers – Omaha', address: '6920 Dodge St', city: 'Omaha', state: 'Nebraska', stateCode: 'NE', zip: '68132', phone: '(402) 558-2233', rating: 4.2, hours: '6 AM – 11 PM', lat: 41.2608, lng: -96.0237, games: ['Powerball', 'Mega Millions', 'Pick 3', 'Pick 5', '2by2', 'MyDay'], type: 'grocery' },

  // ========== IDAHO ==========
  { id: 'ID-001', name: "Jacksons – Boise", address: '2801 W State St', city: 'Boise', state: 'Idaho', stateCode: 'ID', zip: '83702', phone: '(208) 342-0088', rating: 4.1, hours: '24 Hours', lat: 43.6165, lng: -116.2251, games: ['Powerball', 'Mega Millions', 'Idaho Cash', 'Pick 3', 'Weekly Grand'], type: 'gas_station' },

  // ========== MONTANA ==========
  { id: 'MT-001', name: "Town Pump – Billings", address: '2000 Grand Ave', city: 'Billings', state: 'Montana', stateCode: 'MT', zip: '59102', phone: '(406) 652-0011', rating: 4.0, hours: '24 Hours', lat: 45.7772, lng: -108.5632, games: ['Powerball', 'Mega Millions', 'Montana Cash', 'Hot Lotto'], type: 'gas_station' },

  // ========== NEW MEXICO ==========
  { id: 'NM-001', name: "Allsup's – Albuquerque", address: '4500 Central Ave SE', city: 'Albuquerque', state: 'New Mexico', stateCode: 'NM', zip: '87108', phone: '(505) 265-0088', rating: 3.9, hours: '24 Hours', lat: 35.0801, lng: -106.5943, games: ['Powerball', 'Mega Millions', 'Roadrunner Cash', 'Pick 3', 'Pick 4'], type: 'gas_station' },

  // ========== MAINE ==========
  { id: 'ME-001', name: 'Cumberland Farms – Portland', address: '145 Congress St', city: 'Portland', state: 'Maine', stateCode: 'ME', zip: '04101', phone: '(207) 772-3344', rating: 4.1, hours: '24 Hours', lat: 43.6574, lng: -70.2577, games: ['Powerball', 'Mega Millions', 'Megabucks', 'Pick 3', 'Pick 4', 'Lucky For Life'], type: 'gas_station' },

  // ========== NEW HAMPSHIRE ==========
  { id: 'NH-001', name: 'Irving – Manchester', address: '1200 Elm St', city: 'Manchester', state: 'New Hampshire', stateCode: 'NH', zip: '03101', phone: '(603) 624-0011', rating: 4.2, hours: '5 AM – 11 PM', lat: 42.9956, lng: -71.4548, games: ['Powerball', 'Mega Millions', 'Tri-State Megabucks', 'Pick 3', 'Pick 4', 'Lucky For Life'], type: 'gas_station' },

  // ========== RHODE ISLAND ==========
  { id: 'RI-001', name: 'Cumberland Farms – Providence', address: '350 Atwells Ave', city: 'Providence', state: 'Rhode Island', stateCode: 'RI', zip: '02903', phone: '(401) 272-5566', rating: 4.0, hours: '24 Hours', lat: 41.8230, lng: -71.4262, games: ['Powerball', 'Mega Millions', 'Wild Money', 'The Numbers', 'Lucky For Life'], type: 'gas_station' },

  // ========== VERMONT ==========
  { id: 'VT-001', name: 'Maplefields – Burlington', address: '180 Main St', city: 'Burlington', state: 'Vermont', stateCode: 'VT', zip: '05401', phone: '(802) 862-0088', rating: 4.3, hours: '5 AM – 11 PM', lat: 44.4783, lng: -73.2121, games: ['Powerball', 'Mega Millions', 'Tri-State Megabucks', 'Pick 3', 'Pick 4', 'Lucky For Life'], type: 'gas_station' },

  // ========== DELAWARE ==========
  { id: 'DE-001', name: 'Wawa – Wilmington', address: '2300 Concord Pike', city: 'Wilmington', state: 'Delaware', stateCode: 'DE', zip: '19803', phone: '(302) 478-0011', rating: 4.4, hours: '24 Hours', lat: 39.7808, lng: -75.5487, games: ['Powerball', 'Mega Millions', 'Multi-Win Lotto', 'Play 3', 'Play 4', 'Lucky For Life'], type: 'gas_station' },

  // ========== DC ==========
  { id: 'DC-001', name: "Hal's Corner Market", address: '1401 H St NE', city: 'Washington', state: 'DC', stateCode: 'DC', zip: '20002', phone: '(202) 399-0011', rating: 4.2, hours: '7 AM – 11 PM', lat: 38.9001, lng: -76.9874, games: ['Powerball', 'Mega Millions', 'DC-3', 'DC-4', 'DC-5', 'Lucky For Life'], type: 'convenience' },

  // ========== WEST VIRGINIA ==========
  { id: 'WV-001', name: 'Go-Mart – Charleston', address: '4500 MacCorkle Ave SE', city: 'Charleston', state: 'West Virginia', stateCode: 'WV', zip: '25304', phone: '(304) 925-3344', rating: 4.0, hours: '24 Hours', lat: 38.3284, lng: -81.5911, games: ['Powerball', 'Mega Millions', 'Cash 25', 'Daily 3', 'Daily 4'], type: 'gas_station' },

  // ========== SOUTH DAKOTA ==========
  { id: 'SD-001', name: 'Lewis Drug – Sioux Falls', address: '2700 W 41st St', city: 'Sioux Falls', state: 'South Dakota', stateCode: 'SD', zip: '57105', phone: '(605) 332-0088', rating: 4.3, hours: '7 AM – 10 PM', lat: 43.5234, lng: -96.7640, games: ['Powerball', 'Mega Millions', 'Dakota Cash', 'Wild Card 2', 'Lotto America'], type: 'pharmacy' },

  // ========== ALABAMA ==========
  { id: 'AL-001', name: 'RaceTrac – Birmingham', address: '3100 US-280', city: 'Birmingham', state: 'Alabama', stateCode: 'AL', zip: '35223', phone: '(205) 871-0011', rating: 4.1, hours: '24 Hours', lat: 33.4828, lng: -86.7354, games: ['Powerball', 'Mega Millions', 'Pick 3', 'Pick 4'], type: 'gas_station' },
];

export function getStoresByState(stateCode: string): LotteryStoreData[] {
  return ALL_LOTTERY_STORES.filter(s => s.stateCode === stateCode);
}

export function getAvailableStates(): string[] {
  const states = new Set(ALL_LOTTERY_STORES.map(s => s.stateCode));
  return Array.from(states).sort();
}

export function getStateInfo(stateCode: string): USState | undefined {
  return US_STATES.find(s => s.code === stateCode);
}
