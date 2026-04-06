import re
import pandas as pd

def convert_dpr_to_excel(dpr_text, output_filename="Mapped_DPR.xlsx"):
    # Fix broken lines where numbers are pushed to the next line in the raw text
    cleaned_text = re.sub(r'\n\s*[-–]?\s*(\d+/\d+/\d+)', r' - \1', dpr_text)
    
    # Split text into manageable lines
    lines = [line.strip() for line in cleaned_text.split('\n') if line.strip()]
    
    data = []
    current_section = ""
    sub_prefix = ""
    
    for line in lines:
        line_clean = line.lower().replace('*', '').replace('📌', '')
        
        # 1. Detect which section of the DPR we are in
        if 'chain link fencing' in line_clean:
            current_section = 'fencing'; sub_prefix = ""; continue
        elif 'mms work' in line_clean:
            current_section = 'mms'; sub_prefix = ""; continue
        elif 'mcr work' in line_clean:
            current_section = 'mcr'; sub_prefix = ""; continue
        elif 'icr work' in line_clean:
            current_section = 'icr'; sub_prefix = ""; continue
        elif 'idt work' in line_clean:
            current_section = 'idt'; sub_prefix = ""; continue
        elif 'oil soak pit' in line_clean:
            current_section = 'oil_pit'; sub_prefix = ""; continue
        elif 'icog work' in line_clean:
            current_section = 'icog'; sub_prefix = ""; continue
        elif 'dc cable 6' in line_clean:
            current_section = 'dc_6'; sub_prefix = ""; continue
        elif 'smb installation' in line_clean:
            current_section = 'smb'; sub_prefix = ""; continue
        elif 'dc cable 300' in line_clean:
            current_section = 'dc_300'; sub_prefix = ""; continue
        elif 'ac cable' in line_clean:
            current_section = 'ac'; sub_prefix = ""; continue
        elif 'transmission line' in line_clean:
            current_section = 'tl'; sub_prefix = ""; continue
            
        # 2. Detect sub-prefixes (e.g., "ICOG to IDT -")
        if line.endswith('-') and '/' not in line:
            sub_prefix = line.replace('•', '').replace('*', '').replace('-', '').strip() + " "
            continue
            
        # 3. Extract descriptions and numerical data
        match = re.search(r'(.*?)\s*[-–]+\s*(\d+)\s*/\s*(\d+)\s*/\s*(\d+)', line)
        if match:
            raw_desc = match.group(1).replace('•', '').replace('*', '').strip()
            desc = (sub_prefix + raw_desc).strip()
            
            today = int(match.group(2))
            completed = int(match.group(3))
            total = int(match.group(4))
            pending = total - completed
            
            main_cat = ""
            sub_cat = ""
            
            # 4. Map logic to exact target categories
            if current_section == 'fencing':
                main_cat, sub_cat = "Civil Work", "Boundary Chain link Fencing"
            elif current_section == 'mms':
                if any(x in desc.lower() for x in ['pile', 'capping', 'white wash']):
                    main_cat, sub_cat = "Civil Work", "Pile Foundation (MMS)"
                elif 'module' in desc.lower():
                    main_cat, sub_cat = "Mechanical Work", "Module Installation"
                else:
                    main_cat, sub_cat = "Mechanical Work", "MMS Erection"
            elif current_section == 'mcr':
                main_cat, sub_cat = "Civil Work", "MCR Work"
            elif current_section == 'icr':
                if 'inverter' in desc.lower():
                    main_cat, sub_cat = "Electrical Work", "ICR Work"
                else:
                    main_cat, sub_cat = "Civil Work", "ICR Work"
            elif current_section in ['idt', 'oil_pit', 'icog']:
                if 'installation' in desc.lower():
                    main_cat, sub_cat = "Electrical Work", "Equipment Erection"
                else:
                    main_cat, sub_cat = "Civil Work", "Equipment Foundation"
                    prefix_map = {'idt': 'IDT ', 'oil_pit': 'Oil Soak pit ', 'icog': 'ICOG '}
                    if not desc.startswith(prefix_map[current_section].strip()):
                         desc = prefix_map[current_section] + desc
            elif current_section in ['dc_6', 'dc_300']:
                main_cat, sub_cat = "Electrical Work", "DC Cable Laying & Termination"
            elif current_section == 'smb':
                if any(x in desc.lower() for x in ['marking', 'auguring', 'casting', 'caping']):
                    main_cat, sub_cat = "Civil Work", "Equipment Foundation"
                else:
                    main_cat, sub_cat = "Electrical Work", "Equipment Erection"
            elif current_section == 'ac':
                main_cat, sub_cat = "Electrical Work", "AC Cable Laying & Termination"
            elif current_section == 'tl':
                if 'bay' in desc.lower():
                    main_cat, sub_cat = "Transmission Line", "Bay Work"
                else:
                    main_cat, sub_cat = "Transmission Line", "Transmission Line & DP Structures"
            
            # 5. Append structured row
            data.append({
                "Main Category": main_cat,
                "Sub-Category": sub_cat,
                "Work Description": desc,
                "Weightage": "",
                "U.o.M": "Nos",
                "Total Qty": total,
                "Today Completed": today,
                "Total Completed": completed,
                "Pending": pending,
                "Start Date": "",
                "Finish Date": "",
                "Status": ""
            })

    # Convert to DataFrame and export
    df = pd.DataFrame(data)
    df.to_excel(output_filename, index=False)
    print(f"Success! {len(df)} rows have been written to {output_filename}")

# --- Execution ---
raw_dpr_text = """
*DPR*
*Ghodegaon 12 MW Site*
*Date:-* *02/04/2026*
WOD:-
   1. Module & MMS  installation 
2. Civil work curring
3. Module unloading 
4 Cable laying 300 sqmm
Note- Heavy Rain is Impacted Work.
   
🧾Activities completed during the day: Daily completed/Total completed/Total Qty
📌 Chain Link Fencing:
• Marking & Digging – 00/930/1320 Nos
• Fencing Pole Casting –  00/660/1320 Nos
• Base PCC – 00/00/1320 Nos
• Boundary Toe Wall – 00/00/1320 Nos
• Mesh Installation – 00/00/1320 Nos
📌 MMS Work:
• Pile Marking  – 00/5432/5448 Nos
• Pile auguring - 00/5144/5448
• Pile Casting – 00/4800/5448 Nos
• Pile Capping –00 /3950/5448 Nos
• Capping White Wash – 000/3050/5448 Nos
• MMS Rafter
 – 20/770/5448 Nos
• MMS Part Installation – 40/1540/10896 Nos
• MMS Bracing Installation – 40/1540/10896 Nos
• Purlin Fitting tables-
05/75/464
• MMS Tightness – 00/00/464 Nos
• Module Installation-
448/4624/26012 Nos
*📌 MCR Work:*
• Footing Marking – 00/16/16 Nos
• Footing casting - 00/16/16 Nos
• Excavation – 00/16/16 Nos
• PCC – 00/16/16 Nos
•  Footing Column Steel Binding – 00/16/16 Nos
•  Footing Column Casting – 00/16/16 Nos
• Column Steel binding - 00/16/16 Nos 
• Column Shuttering - 00/16/16 Nos
• Column Casting - 00/16/16 Nos
• Plinth beam steel bending- 00/28/28 Nos
• Plinth Beam Casting - 00/28/28 Nos
• Wall Brick Work – 00/04/06 Nos
• Slab Steel Binding – 00/01/01 Nos
• Slab Casting – 00/01/01 Nos
• Finishing Works – 00/00/01 Nos
*📌 ICR Work:*
• Marking – 00/02/03 Nos
• Excavation – 00/02/03 Nos
• PCC – 00/02/03 Nos
• Footing Shuttering - 00/16/24 Nos
• Footing Casting - 00/16/24 
• Column Casting – 00/16/24 Nos
• Beam Casting - 01/01/03
• Slab Casting – 01/01/03 Nos
• Inverter Installation – 00/00/03 Nos
*📌 IDT Work:*
• Footing Marking – 00/02/03 Nos
• Excavation – 00/02/03 Nos
• PCC – 00/02/03 Nos
• Footing casting - 00/02/03
• Column wall Casting –  00/04/06 Nos
• Floor RCC and wall- 00/01/03
• IDT Installation –  00/00/03 Nos
*• Oil Soak pit -*
•Marking- 00/02/03
• Excavation - 00/02/03
• PCC - 00/02/03
• Base Footing - 00/02/03
• Wall Casting - 00/00/03
• Slab - 00/00/03
*📌 ICOG Work:*
• Footing Marking – 00/02/03      Nos
• Excavation – 00/02/03 Nos
• PCC – 00/02/03 Nos
• Footing - 00/16/24
• Column Casting – 00/16/24 Nos
• Beam and Slab casting -
00/00/03
• ICOG Installation – 00/00/03 Nos
*📌 DC cable 6 sq mm:-*
• Cable schedule (inv)-
00/03/03
• DC cable cutting (SMB)-
00/22/46
• DC cable conduit in and laying (SMB) -
00/18/46
• DC cable trench (SMB)
00/18/46
• DC cable laying 6 sq mm(SMB)
00/18/46
•DC cable Backfilling SMB-
00/00/46
• MC4 Connector table side SMB- 00/00/46
• Ferruling and MC4 SMB side-
00/00/46
• VOC and Polarity Test-
00/00/46
*📌 SMB installation:-*
• SMB Marking-
00/22/92
• SMB Pile Auguring -
00/16/92
• SMB Pile casting and caping - 00/00/92
• SMB box Installation -
 00/00/46
• SMB canopy-
 00/00/46
*📌 DC Cable 300 sq mm-*
•  Cable trench excavation SMB-
00/18/46
• DC cable cutting SMB-
00/18/46
• DC cable laying SMB-
02/20/46
• DC cable backfilling SMB-
00/18/46
• Terminations SMB side -
 00/00/46
📌 *AC cable*-
*• ICOG to IDT -*
• Cutting - 00/00/03
• Laying- 00/00/03
• Terminations- 00/00/06
*•IDT to DP structure -
• Cutting - 00/00/03
•Terminations- 00/00/06
*•Inverter to IDT-*
•Cutting - 00/00/96
•Terminations- 00/00/96
*Transmission Line & Bay work*
TL Pole painting - 00/70/86
TL pole Marking- 00/20/140
TL Pole Auguring - 00/07/140
V-Cross installation - 00/06/420
TL Pole erection - 00/12/140
Bay Foundation land development - 00/01/01
Bay Foundation marking- 00/16/16
Bay Foundation excavation-
00/16/16
Bay Foundation PCC - 00/16/16
Bay foundation footing shuttering - 00/04/08
Bay Foundation Footing casting - 
00/00/16
BAY Foundation column shuttering - 00/00/16
Bay Foundation column casting - 00/00/16
"""

convert_dpr_to_excel(raw_dpr_text, "Mapped_DPR_Output.xlsx")