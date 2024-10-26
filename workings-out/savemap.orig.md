===  The Savemap  ===

The following is the general save format for the game. This data excludes the header data that differs between the PSX and PC version. (PSX header is 512 Bytes, checksum @ 0x200) (PC header is 9 bytes, checksum @ 0x11) Note: For the ''preview'' descriptions below, changing these values does not change any in-game values. These are only used so a player can preview the data within the save file when viewing the Save menu.

{| style="border: 1px solid black; border-collapse: collapse; width: 600px" border="1" cellspacing="1" cellpadding="3" align="center"
|+ '''Table 1: FF7 Save Slot'''
|-
! Offset
! Length
! style="background: rgb(204,204,204)" colspan="2" align="center" | Description
|-
| 0x0000
| 2(4) bytes
| colspan="2" |
Checksum ([http://forums.qhimm.com/index.php?topic=4211.msg60545#msg60545 how to generate])<br />Technically this is a DWord, but the checksum generation method only stores the lower Word.
|-
| 0x0004
| 1 byte
| colspan="2" | '''Save Preview'''<nowiki>: Lead character's level </nowiki>
|-
| rowspan="2" | 0x0005
| rowspan="2" | 1 byte
| colspan="2" | '''Save Preview'''<nowiki>: Lead character's portrait </nowiki>
|-
| 0x00: Cloud<br />0x01: Barret<br />0x02: Tifa<br />0x03: Aeris<br />0x04: Red XIII<br />0x05: Yuffie<br />0x06: Cait Sith
| 0x07: Vincent<br />0x08: Cid<br />0x09: Young Cloud<br />0x0A: Sephiroth<br />0x0B: Chocobo<br />0xFF: None
|-
| 0x0006
| 1 byte
| colspan="2" | '''Save Preview'''<nowiki>: 2nd character's portrait </nowiki>
|-
| 0x0007
| 1 byte
| colspan="2" | '''Save Preview'''<nowiki>: 3rd character's portrait </nowiki>
|-
| 0x0008
| 16 bytes
| colspan="2" |
'''Save Preview'''<nowiki>: Lead character's name, </nowiki>[[FF7/FF_Text|FF Text format]] , terminated with 0xFF
|-
| 0x0018
| 2 bytes
| colspan="2" | '''Save Preview'''<nowiki>: Lead character's current HP </nowiki>
|-
| 0x001A
| 2 bytes
| colspan="2" | '''Save Preview'''<nowiki>: Lead character's max HP </nowiki>
|-
| 0x001C
| 2 bytes
| colspan="2" | '''Save Preview'''<nowiki>: Lead character's current MP </nowiki>
|-
| 0x001E
| 2 bytes
| colspan="2" | '''Save Preview'''<nowiki>: Lead character's max MP </nowiki>
|-
| 0x0020
| 4 bytes
| colspan="2" | '''Save Preview'''<nowiki>: Amount of Gil </nowiki>
|-
| 0x0024
| 4 bytes
| colspan="2" | '''Save Preview'''<nowiki>: Total number of seconds played </nowiki>
|-
| 0x0028
| 32 bytes
| colspan="2" |
'''Save Preview'''<nowiki>: Save location, </nowiki>[[FF7/FF_Text|FF Text format]], terminated with 0xFF
|-
| 0x0048
| 3 bytes
| colspan="2" | RGB value for upper left corner of window
|-
| 0x004B
| 3 bytes
| colspan="2" | RGB value for upper right corner of window
|-
| 0x004E
| 3 bytes
| colspan="2" | RGB value for lower left corner of window
|-
| 0x0051
| 3 bytes
| colspan="2" | RGB value for lower right corner of window
|-
| 0x0054
| 132 bytes
| colspan="2" | '''[[#Character_Record|Character Record]]'''<nowiki>: Cloud </nowiki>
|-
| 0x00D8
| 132 bytes
| colspan="2" | '''[[#Character_Record|Character Record]]'''<nowiki>: Barret </nowiki>
|-
| 0x015C
| 132 bytes
| colspan="2" | '''[[#Character_Record|Character Record]]'''<nowiki>: Tifa </nowiki>
|-
| 0x01E0
| 132 bytes
| colspan="2" | '''[[#Character_Record|Character Record]]'''<nowiki>: Aeris's </nowiki>
|-
| 0x0264
| 132 bytes
| colspan="2" | '''[[#Character_Record|Character Record]]'''<nowiki>: Red XIII </nowiki>
|-
| 0x02E8
| 132 bytes
| colspan="2" | '''[[#Character_Record|Character Record]]'''<nowiki>: Yuffie </nowiki>
|-
| 0x036C
| 132 bytes
| colspan="2" | '''[[#Character_Record|Character Record]]'''<nowiki>: Cait Sith (or Young Cloud) </nowiki>
|-
| 0x03F0
| 132 bytes
| colspan="2" | '''[[#Character_Record|Character Record]]'''<nowiki>: Vincent (or Sephiroth) </nowiki>
|-
| 0x0474
| 132 bytes
| colspan="2" | '''[[#Character_Record|Character Record]]'''<nowiki>: Cid </nowiki>
|-
| 0x04F8
| 1 byte
| colspan="2" | Party member in slot 1 [uses same format as character portrait above]
|-
| 0x04F9
| 1 byte
| colspan="2" | Party member in slot 2
|-
| 0x04FA
| 1 byte
| colspan="2" | Party member in slot 3
|-
| 0x04FB
| 1 byte
| colspan="2" | Alignment (Always 0xFF)
|-
| 0x04FC
| 640 bytes
| colspan="2" |
Party Item stock, 2 bytes per item, 320 item slots max [See [[#Save_Item_List|save item list]] below]
|-
| 0x077C
| 800 bytes
| colspan="2" |
Party Materia stock, 4 bytes per materia, 200 materia max [See [[#Save_Materia_List|save materia list]] ]
|-
| 0x0A9C
| 192 bytes
| colspan="2" |
Materia stolen by Yuffie, 4 bytes per materia, 48 materia max [See [[#Save_Materia_List|save materia list]] ]
|-
| style="background: rgb(255,205,154)" | 0x0B5C
| style="background: rgb(255,205,154)" | 32 bytes
| style="background: rgb(255,205,154)" colspan="2" | z_3 Unknown (Always 0xFF?)
|-
| 0x0B7C
| 4 bytes
| colspan="2" | Party's Gil amount
|-
| 0x0B80
| 4 bytes
| colspan="2" | Total number of seconds played
|-
| 0x0B84
| 4 bytes
| colspan="2" | Countdown Timer (in seconds)
|-
| style="background: rgb(255,205,154); border-bottom: 1px solid #FF9A33" | 0x0B88
| style="background: rgb(255,205,154); border-bottom: 1px solid #FF9A33" | 12 bytes
| style="background: rgb(255,205,154); border-bottom: 1px solid #FF9A33" colspan="2" | z_4 Unknown
|-
| style="background: rgb(255,205,154); border-top: 1px dashed" | 0x0B88<br />z_4[0]
| style="background: rgb(255,255,204); border-top: 1px dashed; border-left: 1px dashed; border-right: 1px dashed" | 4 byte
| style="background: rgb(255,255,204); border-top: 1px dashed" colspan="2" |
Used to calculate fractions of seconds (1/65535) of Game timer (0x0B80).<br />Technically this is a DWord, but only the lower Word is used.
|-
| style="background: rgb(255,205,154); border-top: 1px dashed" | 0x0B8C<br />z_4[4]
| style="background: rgb(255,255,204); border-top: 1px dashed; border-left: 1px dashed; border-right: 1px dashed" | 4 byte
| style="background: rgb(255,255,204); border-top: 1px dashed" colspan="2" |
Used to calculate fractions of seconds (1/65535) of Countdown timer (0x0B84).<br />Share the same value with 0x0B88.
|-
| style="background: rgb(255,205,154); border-top: 1px dashed" | 0x0B90<br />z_4[8]
| style="background: rgb(255,255,204); border-top: 1px dashed; border-left: 1px dashed; border-right: 1px dashed" | 4 byte
| style="background: rgb(255,255,204); border-top: 1px dashed" colspan="2" |
This is set along with Current map value (0x0B94).<br />If Current module value is 1, this is set to 2.<br /> If Current module value is 3, this is set to 0.<br /> Technically this is a DWord, but only the lower Byte is used.
|-
| 0x0B94
| 2 bytes
| colspan="2" |
Current [[FF7/Engine_basics|module]]<br />If value is 1, the game was saved in the field.<br /> If value is 3, the game was saved in the world map.
|-
| 0x0B96
| 2 bytes
| colspan="2" | Current location
|-
| 0x0B98
| 2 bytes
| colspan="2" | Alignment (Always 0x00)
|-
| 0x0B9A
| 2 bytes
| colspan="2" | X location on Field map (Signed)
|-
| 0x0B9C
| 2 bytes
| colspan="2" | Y location on Field map (Signed)
|-
| 0x0B9E
| 2 bytes
| colspan="2" | Triangle Id of player on Field map (Unsigned)
|-
| 0x0BA0
| 1 byte
| colspan="2" | Direction of Player Model on Field Map(Unsigned)
|-
| style="background: rgb(255,205,154); border-bottom: 1px solid #FF9A33" | 0x0BA1
| style="background: rgb(255,205,154); border-bottom: 1px solid #FF9A33" | 3 bytes
| style="background: rgb(255,205,154); border-bottom: 1px solid #FF9A33" colspan="2" | z_6 Unknown
|-
| style="background: rgb(255,205,154); border-top: 1px dashed" | 0x0BA1<br />z_6[0]
| style="background: rgb(255,255,204); border-top: 1px dashed; border-left: 1px dashed; border-right: 1px dashed" | 1 byte
| style="background: rgb(255,255,204); border-top: 1px dashed" colspan="2" |
Field Encounter Timer: StepID/Seed ([http://web.archive.org/web/20170518233623/http://forums.qhimm.com/index.php?topic=6431.msg81091#msg81091 [1]])
|-
| style="background: rgb(255,205,154); border-top: 1px dashed" | 0x0BA2<br />z_6[1]
| style="background: rgb(255,255,204); border-top: 1px dashed; border-left: 1px dashed; border-right: 1px dashed" | 1 byte
| style="background: rgb(255,255,204); border-top: 1px dashed" colspan="2" |
Field Encounter Timer: Offset ([http://web.archive.org/web/20170518233623/http://forums.qhimm.com/index.php?topic=9625.msg191219#msg191219 [2]])
|-
| style="background: rgb(255,205,154); border-top: 1px dashed" | 0x0BA3<br />z_6[2]
| style="background: rgb(255,255,204); border-top: 1px dashed; border-left: 1px dashed; border-right: 1px dashed" | 1 byte
| style="background: rgb(255,255,204); border-top: 1px dashed" colspan="2" | Alignment (Always 0x00)
|-
| style="background: rgb(205,205,154)" | 0x0BA4
| style="background: rgb(205,205,154)" |
| style="background: rgb(205,205,154)" colspan="2" |
[BEGINNING OF FIELD SCRIPT MEMORY [[#Save_Memory_Bank_1.2F2|BANK 1 (1/2)]]]
|-
| style="background: rgb(205,205,154)" | 0x0CA4
| style="background: rgb(205,205,154)" |
| style="background: rgb(205,205,154)" colspan="2" |
[BEGINNING OF FIELD SCRIPT MEMORY [[#Save_Memory_Bank_3.2F4|BANK 2 (3/4)]]]
|-
| style="background: rgb(205,205,154)" | 0x0DA4
| style="background: rgb(205,205,154)" |
| style="background: rgb(205,205,154)" colspan="2" |
[BEGINNING OF FIELD SCRIPT MEMORY [[#Save_Memory_Bank_B.2FC|BANK 3 (B/C)]]]
|-
| style="background: rgb(205,205,154)" | 0x0EA4
| style="background: rgb(205,205,154)" |
| style="background: rgb(205,205,154)" colspan="2" |
[BEGINNING OF FIELD SCRIPT MEMORY [[#Save_Memory_Bank_D.2FE|BANK 4 (D/E)]]]
|-
| style="background: rgb(205,205,154)" | 0x0FA4
| style="background: rgb(205,205,154)" |
| style="background: rgb(205,205,154)" colspan="2" |
[BEGINNING OF FIELD SCRIPT MEMORY [[#Save_Memory_Bank_7.2FF|BANK 5 (7/F)]]]
|-
| rowspan="2" | 0x10A4
| rowspan="2" | 2 bytes
| colspan="2" | PHS Locking Mask (1: Locked)
|-
| colspan="2" |
{| class="wikitable"
| style="background: rgb(68,144,205)" | LSB
| style="background: rgb(205,205,230)" | Cloud
| style="background: rgb(205,205,230)" | Barret
| style="background: rgb(205,205,230)" | Tifa
| style="background: rgb(205,205,230)" | Aeris
| style="background: rgb(205,205,230)" | Red
| style="background: rgb(205,205,230)" | Yuffie
| style="background: rgb(205,205,230)" | Vincent
| style="background: rgb(205,205,230)" | Cait
| style="background: rgb(205,205,230)" | Cid
| style="background: rgb(68,144,205)" | MSB
|}
|-
| rowspan="2" | 0x10A6
| rowspan="2" | 2 bytes
| colspan="2" | PHS Visibility Mask (does not ''turn off'' party characters)
|-
| colspan="2" |
{| class="wikitable"
| style="background: rgb(68,144,205)" | LSB
| style="background: rgb(205,205,230)" | Cloud
| style="background: rgb(205,205,230)" | Barret
| style="background: rgb(205,205,230)" | Tifa
| style="background: rgb(205,205,230)" | Aeris
| style="background: rgb(205,205,230)" | Red
| style="background: rgb(205,205,230)" | Yuffie
| style="background: rgb(205,205,230)" | Vincent
| style="background: rgb(205,205,230)" | Cait
| style="background: rgb(205,205,230)" | Cid
| style="background: rgb(68,144,205)" | MSB
|}
|-
| style="background: rgb(255,205,154)" | 0x10A8
| style="background: rgb(255,205,154)" | 48 bytes
| style="background: rgb(255,205,154)" colspan="2" | z_39 Unknown (Always 0x00?)
|-
| 0x10D8
| 1 byte
| colspan="2" | Battle Speed (0x00: fastest, 0xFF: slowest)
|-
| 0x10D9
| 1 byte
| colspan="2" | Battle Message Speed
|-
| rowspan="5" | 0x10DA
| rowspan="5" | 1 byte
| colspan="2" | General configuration
|-
| colspan="2" | Sound: mono (0x00); stereo (0x01)
|-
| colspan="2" | Controller: normal (0x00); customize (0x04)
|-
| colspan="2" | Cursor: initial (0x00); memory (0x10)
|-
| colspan="2" | ATB: Active (0x00); Recommended (0x40); Wait (0x80)
|-
| rowspan="4" | 0x10DB
| rowspan="4" | 1 byte
| colspan="2" | General configuration (continued)
|-
| colspan="2" | Camera angle: Auto (0x00); Fix (0x01)
|-
| colspan="2" | Magic order: (game crashes if flag set to 0x18 or 0x1C)<br /> "1. restore attack indirect" (0x00)<br />"2. restore indirect attack" (0x04)<br />"3. attack indirect restore" (0x08)<br />"4. attack restore indirect" (0x0C)<br />"5. indirect restore attack" (0x10)<br />"6. indirect attack restore" (0x14)<br />
|-
| colspan="2" | Extra battle window displaying information: Inactive (0x00); Active (0x40)
|-
| 0x10DC
| 16 bytes
| colspan="2" | Controller Mapping (PSX ONLY) <br />l2,r2,l1,r1,tri,circle,cross,square,Select,?,?,Start,u,r,d,l<br />l2,r2,l1,r1,Menu,OK,Cancel,Ext,Help,?,?,Pause,u,r,d,l
|-
| 0x10EC
| 1 byte
| colspan="2" | Message Speed
|-
| style="background: rgb(255,205,154)" | 0x10ED
| style="background: rgb(255,205,154)" | 7 bytes
| style="background: rgb(255,205,154)" colspan="2" | z_40 Unknown (Always 0x00?)
|}

==  Save Memory Bank 1/2  ==

{| style="border: 1px solid black; border-collapse: collapse; width: 600px" border="1" cellspacing="1" cellpadding="3" align="center"
|+ '''Table 1: FF7 Save Slot'''
|-
! Offset
! Length
! Description
|-
| 0x0BA4
| 2 byte
| Main progress variable
|-
| style="background: rgb(255,205,154)" | 0x0BA6<br />z_7[0]
| 1 Byte
|
Yuffie's Initial Level (z_7 Unknown) Byte value before Yuffie join the team: 0x00.<br /> (If byte's value is changed, then you can't fight Yuffie, so she can't be obtained).<br /> Yuffie's Initial Level only is set when she already join the team.<br /> Credit to [[Savemap|(NFITC1)]]
|-
| 0x0BA7
| 1 byte
| Aeris' current love points
|-
| 0x0BA8
| 1 byte
| Tifa's current love points
|-
| 0x0BA9
| 1 byte
| Yuffie's current love points
|-
| 0x0BAA
| 1 byte
| Barret's current love points
|-
| style="background: rgb(255,205,154)" | 0x0BAB
| style="background: rgb(255,205,154)" | 17 bytes
| style="background: rgb(255,205,154)" | z_8 Unknown
|-
| style="background: rgb(255,205,154)" | 0x0BAB<br />z_8[0]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" |
1<sup>st</sup> temp party member char ID placeholder<br />This is used to store the player's party configuration before they are overridden for a special event that requires a specific character setup using GTPYE. {elm/first/s1}<br /> The player's original party configuration can then be set back to its original setup using SPTYE. {elminn_2/ballet/s11}<br />
|-
| style="background: rgb(255,205,154)" | 0x0BAC<br />z_8[1]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" | 2<sup>nd</sup> temp party member char ID placeholder<br />
|-
| style="background: rgb(255,205,154)" | 0x0BAD<br />z_8[2]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" | 3<sup>ed</sup> temp party member char ID placeholder<br />
|-
| style="background: rgb(255,205,154)" | 0x0BAE<br />z_8[3]
| style="background: rgb(255,205,154)" | 6 byte
| style="background: rgb(255,205,154)" | Unknown (Always 0x00?)<br />
|-
| style="background: rgb(255,205,154)" | 0x0BB4<br />z_8[9]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" | Game Timer Hours
|-
| style="background: rgb(255,205,154)" | 0x0BB5<br />z_8[10]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" | Game Timer Minutes
|-
| style="background: rgb(255,205,154)" | 0x0BB6<br />z_8[11]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" | Game Timer Seconds
|-
| style="background: rgb(255,205,154)" | 0x0BB7<br />z_8[12]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" | Game Timer Frames. From 0x00 to ~0x21 in one sec.(33 FPS?)
|-
| style="background: rgb(255,205,154)" | 0x0BB8<br />z_8[13]
| style="background: rgb(254,254,255)" | 1 bytes
| style="background: rgb(254,254,255)" | Countdown Timer Hours
|-
| style="background: rgb(255,205,154)" | 0x0BB9<br />z_8[14]
| style="background: rgb(254,254,255)" | 1 bytes
| style="background: rgb(254,254,255)" | Countdown Timer Minutes
|-
| style="background: rgb(255,205,154)" | 0x0BBA<br />z_8[15]
| style="background: rgb(254,254,255)" | 1 bytes
| style="background: rgb(254,254,255)" | Countdown Timer Seconds
|-
| style="background: rgb(255,205,154)" | 0x0BBB<br />z_8[16]
| style="background: rgb(254,254,255)" | 1 bytes
| style="background: rgb(254,254,255)" | Countdown Timer Frames. From 0 to 30 (dec) in one sec.
|-
| 0x0BBC
| 2 bytes
| Number of battles fought
|-
| 0x0BBE
| 2 bytes
| Number of escapes
|-
| rowspan="2" | 0x0BC0
| rowspan="2" | 2 bytes
| colspan="2" | Menu Visiblity Mask (Quit not affected)
|-
| colspan="2" |
{| class="wikitable"
| style="background: rgb(68,144,205)" | LSB
| style="background: rgb(205,205,230)" | item
| style="background: rgb(205,205,230)" | magic
| style="background: rgb(205,205,230)" | materia
| style="background: rgb(205,205,230)" | equip
| style="background: rgb(205,205,230)" | status
| style="background: rgb(205,205,230)" | order
| style="background: rgb(205,205,230)" | limit
| style="background: rgb(205,205,230)" | config
| style="background: rgb(205,205,230)" | PHS
| style="background: rgb(205,205,230)" | save
| style="background: rgb(68,144,205)" | MSB
|}
|-
| rowspan="2" | 0x0BC2<br />
| rowspan="2" | 2 bytes
| colspan="2" | Menu Locking Mask (1: Locked) (Quit not affected)
|-
| colspan="2" |
{| class="wikitable"
| style="background: rgb(68,144,205)" | LSB
| style="background: rgb(205,205,230)" | item
| style="background: rgb(205,205,230)" | magic
| style="background: rgb(205,205,230)" | materia
| style="background: rgb(205,205,230)" | equip
| style="background: rgb(205,205,230)" | status
| style="background: rgb(205,205,230)" | order
| style="background: rgb(205,205,230)" | limit
| style="background: rgb(205,205,230)" | config
| style="background: rgb(205,205,230)" | PHS
| style="background: rgb(205,205,230)" | save
| style="background: rgb(68,144,205)" | MSB
|}
|-
| style="background: rgb(255,205,154)" | 0x0BC4
| style="background: rgb(255,205,154)" | 16 bytes
| style="background: rgb(255,205,154)" | z_9 Unknown
|-
| style="background: rgb(255,205,154)" | 0x0BC4<br />z_9[0]
| style="background: rgb(255,205,154)" | 4 byte
| style="background: rgb(255,205,154)" | Unknown (Always 0x00?)<br />
|-
| style="background: rgb(255,205,154)" | 0x0BC8<br />z_9[4]
| 1 byte
|
Field Items, Sector 7 Train Graveyard<br />Item bit mask ([[Bit_numbering|LBS]]) (applied when you pick them up).<br /> Bit=0(Item on the floor), Bit=1(Item Picked Up).<br /> 0x01: Hi-Potion.(mds7st1|Barrel 1)<br /> 0x02: Echo Screen.(mds7st1|Barrel 2)<br /> 0x04: Potion.(mds7st2|Floor 2)<br /> 0x08: Ether.(mds7st2|Floor 3)<br /> 0x10: Hi-Potion.(mds7st1|Roof Train 1)<br /> 0x20: Potion.(mds7st1|Inside Train 2)<br /> 0x40: Potion.(mds7st1|Floor 1)<br /> 0x80: Hi-Potion.(mds7st2|Roof Train 2)<br />
|-
| style="background: rgb(255,205,154)" | 0x0BC9<br />z_9[5]
| 1 byte
|
Field Items<br />0x01: Elixir {hyou8_2/tr00/s1}<br /> 0x02: Potion {hyou5_1/tr00/s1}<br /> 0x04: Safety Bit {hyou5_3/trbox/s1}<br /> 0x08: Mind Source {hyou2/trbox/s1}<br /> 0x10: Sneak Glove {mkt_w/event/s1}<br /> 0x20: Premium Heart {mkt_ia/event/s3}{mkt_ia/line00/s4}<br /> 0x40: Unused<br /> 0x80: Unused<br />
|-
| style="background: rgb(255,205,154)" | 0x0BCA<br />z_9[6]
| style="background: rgb(255,205,154)" | 10 byte
| style="background: rgb(255,205,154)" | Unknown (Always 0x00?)<br />
|-
| 0x0BD4
| 1 byte
|
Item bit mask ([[Bit_numbering|LBS]])(applied when you pick them up). Field Item / Materia<br /> Bit=0(Item on the floor), Bit=1(Item Picked Up).<br /> 0x01: Potion {md8_3/p/s1}<br /> 0x02: Potion + Phoenix Down {ealin_2/zu/s1}<br /> 0x04: Ether {eals_1/p/s1}<br /> 0x08: Cover Materia {eals_1/mp/s1}<br /> 0x10: Choco-Mog Summon {farm/dancer/s1}<br /> 0x20: Sense Materia {mds6_22/mat/s1}<br /> 0x40: Ramuh Summon {crcin_2/mat/s1}<br /> 0x80: Mythril Key Item {zz1/m1/s1}<br />
|-
| 0x0BD5
| 1 byte
|
Materia Cave / Northern Cave (Item bit mask)<br />0x01: Mime Materia {zz5/l1,l2,l3,l4/s1}<br /> 0x02: HP&lt;-&gt;MP Materia {zz6/mat/s1}<br /> 0x04: Quadra Magic Materia {zz7/l1,l2,l3,l4/s1}<br /> 0x08: Knights of the Round Summon {zz8/l1,l2,l3,l4/s1}<br /> 0x10: Elixir {las3_1/hako1/s1}{las4_0/cid/s1}<br /> 0x20: X-Potion {las3_1/hako2/s1}<br /> 0x40: Turbo Ether {las3_2/hako1/s1}{las4_0/tifa/s1}{las4_0/cait/s1}<br /> 0x80: Vaccine {las3_2/hako2/s1}{las4_0/yufi/s1}<br />
|-
| style="background: rgb(255,205,154)" | 0x0BD6
| style="background: rgb(255,205,154)" | 14 bytes
| style="background: rgb(255,205,154)" | z_10 Unknown
|-
| style="background: rgb(255,205,154)" | 0x0BD6<br />z_10[0]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" |
Field Items Northern Cave<br />0x01: Magic Counter Materia {las3_2/mat/s1}<br /> 0x02: Speed Source {las3_3/hako1/s1}{las4_0/red/s1}<br /> 0x04: Turbo Ether {las3_3/hako2/s1}<br /> 0x08: X-Potion {las3_3/hako3/s1}<br /> 0x10: Mega All {las3_3/mat/s3}{las4_0/vincent/s1}<br /> 0x20: Luck Source {las4_1/hako1/s1}<br /> 0x40: Remedy {las3_1/hako3/s1}{las4_0/ballet/s1}<br /> 0x80: Bolt Ring {zz1/m1/s1}<br />
|-
| style="background: rgb(255,205,154)" | 0x0BD7<br />z_10[1]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" |
Field Items<br />0x01: Gold Armlet {zz2/m/s8}<br /> 0x02: Great Gospel {zz2/m/s7}<br /> 0x04: Shooting Coaster prize Umbrella {jetin1/dic/s0}<br /> 0x08: Shooting Coaster prize Flayer {jetin1/dic/s0}<br /> 0x10: Death Penalty + Chaos {zz4/buki/s1}<br /> 0x20: Elixir {ghotin_2/reizo/s1}<br /> 0x40: Enemy Skill animation displayed {zz3/mat/s3}<br /> 0x80: Enemy Skill {zz3/mat/s1}<br />
|-
| style="background: rgb(255,205,154)" | 0x0BD8<br />z_10[2]
| style="background: rgb(255,255,204)" | 4 byte
| style="background: rgb(255,255,204)" | Unknown (Always 0x00?)<br />
|-
| style="background: rgb(255,205,154)" | 0x0BDC<br />z_10[6]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" |
Field Items, Sector 7 Wall Market and Shinra HQ<br />Item bit mask ([[Bit_numbering|LBS]]) (applied when you pick them up).<br /> Bit=0(Item on the floor), Bit=1(Item Picked Up).<br /> 0x01: Ether.(Corneo's masion basement floor) {colne_4/TAKARA/s1}<br /> 0x02: Hyper.(Corneo's masion corneo 's bedroom floor) {colne_6/TAKARA/s1}<br /> 0x04: Phoenix Down (Corneo's masion 2nd floor right room) {colne_3/TAKARA/s1}<br /> 0x08: Elixir at Shinra HQ stairs {blinst_2/TAKARA/s1}<br /> 0x10: Unused<br /> 0x20: Magic Source {cosmin7/TAKARA/s1}<br /> 0x40: First Midgar Part Key Item {blin65_1/PARTA/s1}<br /> 0x80: Second Midgar Part at Shinra HQ {blin65_1/PARTB/s1}<br />
|-
| style="background: rgb(255,205,154)" | 0x0BDD<br />z_10[7]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" |
Field Items, Shinra HQ <br />Item bit mask ([[Bit_numbering|LBS]]) (applied when you pick them up).<br /> Bit=0(Item on the floor), Bit=1(Item Picked Up).<br /> 0x01: Third Midgar Part Key Item {blin65_1/PARTC/s1}<br /> 0x02: Fourth Midgar Part Key Item {blin65_1/PARTD/s1}<br /> 0x04: Fifth Midgar Part Key Item {blin65_1/PARTE/s1}<br /> 0x08: Keycard 66 Key Item {blin65_1/TAKARA/s1}<br /> 0x10: All Materia {shpin_2/TAKARAA/s1}<br /> 0x20: Ether {shpin_2/TAKARAB/s1}<br /> 0x40: Wind Slash {shpin_3/TAKARA/s1}<br /> 0x80: Fairy Ring {gidun_4/TAKARAA/s1}<br />
|-
| style="background: rgb(255,205,154)" | 0x0BDE<br />z_10[8]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" |
Field Items<br />0x01: X-Potion {gidun_4/TAKARAB/s1}<br /> 0x02: Added Effect Materia {gidun_1/TAKARAA/s1}<br /> 0x04: Black M-phone {gidun_2/TAKARAA/s1}<br /> 0x08: Ether {gidun_2/TAKARAB/s1}<br /> 0x10: Elixir {cosmin6/TAKARA/s1}<br /> 0x20: HP Absorb Materia {hideway3/TAKARA/s4}<br /> 0x40: Magic Shuriken {hideway1/TAKARA/s4}<br /> 0x80: Hairpin {hideway2/TAKARA/s4}<br />
|-
| style="background: rgb(255,205,154)" | 0x0BDF<br />z_10[9]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" |
Field Items<br />0x01: Keycard 62 Key Item {blin61/ZAKOA/s1}<br /> 0x02: MP Absorb Materia {uta_im/TAKARAA/s1}<br /> 0x04: Swift Bolt {uttmpin4/TAKARAA/s1}<br /> 0x08: Elixir {uttmpin4/TAKARAB/s1}<br /> 0x10: Pile Bunker {blin2_i/TAKARAA/s1}<br /> 0x20: Master Fist {blin2_i/TAKARAB/s1}<br /> 0x40: Behemoth Horn {blinst_2/TAKARB/s1}<br /> 0x80: Full Cure Materia {cosmin7/TAKARAA/s1}<br />
|-
| style="background: rgb(255,205,154)" | 0x0BE0<br />z_10[10]
| style="background: rgb(255,255,204)" | 4 byte
| style="background: rgb(255,255,204)" | Unknown (Always 0x00?)<br />
|-
| 0x0BE4
| 8 bytes
| Key items [see Key Item List]
|-
| style="background: rgb(255,205,154)" | 0x0BEC
| style="background: rgb(255,205,154)" | 8 bytes
| style="background: rgb(255,205,154)" | z_11 Unknown
|-
| style="background: rgb(255,205,154)" | 0x0BEC<br />z_11[0]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252" | Northern Cave - Progress (TODO: more info)
|-
| style="background: rgb(255,205,154)" | 0x0BED<br />z_11[1]
| style="background: rgb(255,205,154)" | 1 byte
| style="background: rgb(255,205,154)" | Unknown (Always 0x00?)<br />
|-
| style="background: rgb(255,205,154)" | 0x0BEE<br />z_11[2]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" | Northern Cave - Progress (TODO: more info)
|-
| style="background: rgb(255,205,154)" | 0x0BEF<br />z_11[3]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Items mask, Chocobo Farm ([[Bit_numbering|LBS]])(applied when you take the item).<br />Bit=0(Item in field), Bit=1(Item taken).<br /> 0x01: Activated right after getting Choco-Mog{farm/mat/s1}(Is set by kernel, not from Field) (See 0x0BD4[4])<br /> 0x02: Activated right after getting Enemy Skill {blin68_2/mtr/s1}(Is set by kernel, not from Field) (See 0x0FC6[2])<br /> 0x04: <br /> 0x08: <br /> 0x10: <br /> 0x20: <br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0BF0<br />z_11[4]
| style="background: rgb(255,205,154)" | 4 byte
| style="background: rgb(255,205,154)" | Unknown (Always 0x00?)<br />
|-
| 0x0BF4
| 1 byte
| Aeris battle love points
|-
| 0x0BF5
| 1 byte
| Tifa battle love points
|-
| 0x0BF6
| 1 byte
| Yuffie battle love points
|-
| 0x0BF7
| 1 byte
| Barret battle love points
|-
| style="background: rgb(255,205,154)" | 0x0BF8
| style="background: rgb(255,205,154)" | 1 bytes
| style="background: rgb(255,205,154)" | z_12 Unknown
|-
| 0x0BF9
| 1 byte
| Rating for Penned Chocobo Number 1 (01: Wonderful -&gt; 08: Worst)
|-
| 0x0BFA
| 1 byte
| Rating for Penned Chocobo Number 2
|-
| 0x0BFB
| 1 byte
| Rating for Penned Chocobo Number 3
|-
| 0x0BFC
| 1 byte
| Rating for Penned Chocobo Number 4
|-
| style="background: rgb(255,205,154)" | 0x0BFD
| style="background: rgb(255,205,154)" | 2 bytes
| style="background: rgb(255,205,154)" | z_13 Unknown
|-
| 0x0BFF
| 3 bytes
| Ultimate Weapon's remaining HP
|-
| style="background: rgb(255,205,154)" | 0x0C02
| style="background: rgb(255,205,154)" | 28 bytes
| style="background: rgb(255,205,154)" | z_14 Unknown
|-
| style="background: rgb(255,205,154)" | 0x0C02<br />z_14[0]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Northern Cave, bit mask<br />0x01: Set if Dragon Zombie has used Pandora's Box<br /> 0x02: Unknown<br /> 0x04: Northern Cave - Progress (TODO: more info)<br /> 0x08: Unknown<br /> 0x10: Unknown<br /> 0x20: Northern Cave - Bizarro Sephiroth Battle Progress: Second time you switch between party groups in battle change to 0xE0.<br /> 0x40: Northern Cave - Bizarro Sephiroth Battle Progress: First time you switch between party groups in battle change to 0xC0.<br /> 0x80: Northern Cave - Bizarro Sephiroth Battle Progress: Set to 0x80 on Bizarro Sephiroth battle start.<br />
|-
| style="background: rgb(255,205,154)" | 0x0C14<br />z_14[18]
| style="background: rgb(225,236,252)" | 2 bytes
| style="background: rgb(225,236,252)" | Current Battle Points (Battle Square)
|-
| style="background: rgb(255,205,154)" | 0x0C18<br />z_14[22]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" | Current Number of Battles Won (Battle Square)
|-
| 0x0C1E
| 1 bytes
|
Needs more research. (bit=0: show tutorial. bit=1: hide tutorial.)<br />0x01: Junnon Parade (Jump to map junone22) {junonr1/evl0/s3}<br /> 0x02: Space Animation displayed {rcktin7/space/s3}<br /> 0x04: Grey Submarine Tutorial already seen?<br /> 0x08: Forgotten City Animation displayed {loslake1/ev1/s3}<br /> 0x10: unknown<br /> 0x20: Snow Area Tutorial already seen?<br /> 0x40: Display Field Help<br /> 0x80: Bizarro Sephiroth Battle, set if main group is currently fighting.<br />
|-
| 0x0C1F
| 1 bytes
|
Weapons Killed<br />0x01: Ultimate Weapon killed (enables Special Battles at Battle Sq) {COLOIN1/s2/s1}<br /> 0x04: Ultima Weapon's HP < 20,000<br /> 0x08: Ruby Weapon<br /> 0x10: Emerald Weapon
|-
| style="background: rgb(255,205,154)" | 0x0C20
| style="background: rgb(255,205,154)" | 4 bytes
| style="background: rgb(255,205,154)" | z_15 Unknown
|-
| style="background: rgb(255,205,154)" | 0x0C20<br />z_15[0]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Which Chocobo was taken out from the stable.<br />00 / 01 - 06 Which stable's Chocobo was taken out. The stable is displayed empty, but still occupied. 00: Chocobo can be taken out even if another Chocobo is exist on world map. - (* Glitch) Not 00: Chocobo cannot be taken out even if no Chocobo is exist on world map.
|-
| style="background: rgb(255,205,154)" | 0x0C21<br />z_15[1]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Riding off wild chocobo dialog options.<br />0x01 Enter direction to Chocobo Farm &amp; Show send/release Wild Chocobo option when riding off. ON: Right of ranch / Show option OFF: In front of cage / Hide option Set to "ON" after buying chocobo stable.
|-
| style="background: rgb(255,205,154)" | 0x0C22<br />z_15[2]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Chocobo display value on world map ([[Bit_numbering|LBS]]).<br />Bit=0(Disabled), Bit=1(Enabled).<br /> Ex: Wild Chocobo (0x01) + Black Chocobo (0x20) = Byte value 0x21 <br /> 0x01: Caught wild chocobo<br /> 0x02: Riding Chocobo<br /> 0x04: Yellow<br /> 0x08: Green<br /> 0x10: Blue<br /> 0x20: Black<br /> 0x40: Gold<br /> 0x80: None?<br />
|-
| style="background: rgb(255,205,154)" | 0x0C23<br />z_15[3]
| 1 byte
|
Vehicle display value on world map ([[Bit_numbering|LBS]]).<br />Note: if disk is different than 1, buggy is invisible.<br /> Bit=0(Disabled), Bit=1(Enabled).<br /> Ex: Buggy (0x01) + Tiny Bronco (0x04) = Byte value 0x05 <br /> Byte value 0x00: None<br /> 0x01: Buggy<br /> 0x02: Buggy (bit=1:Driving it | bit=0: Don't)<br /> 0x04: Tiny Bronco<br /> 0x08: Unknown/Unused<br /> 0x10: Highwind<br /> 0x20: Highwind (bit=1: Flying in the sky | bit=0: On the ground)<br /> 0x40: Unknown/Unused<br /> 0x80: Unknown/Unused<br />
|-
| style="background: rgb(255,205,154)" | 0x0C24
| style="background: rgb(255,205,154)" | 97 bytes
| style="background: rgb(255,205,154)" | z_16 Unknown
|-
| style="background: rgb(255,205,154)" | 0x0C24<br />z_16[0]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Field mask, Corel ([[Bit_numbering|LBS]])(applied when you take the item).<br /> Bit=0(Item in field), Bit=1(Item taken).<br /> 0x01: Barret talks about his hometown before enter the Ropeway for first time {ROPEST[1][1-Main][49]}<br /> 0x02: Free rest in corel inn {NCOINN[0][0-Main][5]}<br /> 0x04: Villagers rebuke Barret {NCOREL[13][1][3]}<br /> 0x08: <br /> 0x10: <br /> 0x20: If you couldn't stop the train {NCOREL2[5][2][4]}<br /> 0x40: Huge Materia Key Item {NOREL3[1][0-Main][7]}<br /> 0x80: Ultima Materia {NCOREL2[2][4][26]}{NCOREL3[24][4][20]}{NCOIN2[8][1][25]}<br />
|-
| style="background: rgb(255,205,154)" | 0x0C25<br />z_16[1]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Field mask ([[Bit_numbering|LBS]])(applied when you take the item).<br /> Bit=0(Item in field), Bit=1(Item taken).<br /> 0x01: Priscilla Warnings (Reset after read): "It gets deeper the farther you go..." or (High Voltage through tower base) {UJUNON2/cloud/s12}<br /> 0x02: Oldman: "Young man, do CPR!" {UJUNON4/oldm1/s3}<br /> 0x04: Free rest: "You all must be tired. If you want to get some rest, stay here." {JUMIN/drctr/s0}<br /> 0x08: Talk with oldm1 about seeing "a man with a black cape" {UJUNON1/cloud/s10}<br /> 0x10: Priscilla: "It gets deeper the farther you go..." {UJUNON2/cloud/s12}<br /> 0x20: Tifa: "No...it was 5 years ago" {JUMIN/tifa/s9}<br /> 0x40: Cloud: "Hey!!" (Group designate cloud to clim the High Tower) {ujunon1/cloud/s15}<br /> 0x80: If you reach the top of the pole{UJUNON3/ad/s5}<br />
|-
| style="background: rgb(255,205,154)" | 0x0C26<br />z_16[2]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Field mask ([[Bit_numbering|LBS]])(applied when you take the item).<br /> Bit=0(Item in field), Bit=1(Item taken).<br /> 0x01: man1: "It's dangerous, please don't go!" if you choose "I'm still going" {SNOW/man1/s3}<br /> 0x02: Snowboard Key Item {SNMIN1/board/s1}<br /> 0x04: If you choose to kick Shinra Soldier's butt {SNOW/SINRAH1,SINRAH2,SINRAH3/s2}<br /> 0x08: Elena punch Cloud {SNOW/man1/s3}{SNOW/irena/s11}<br /> 0x10: Cloud wake-up in Gast home after beeing punched {SNMAYOR/drctr/s0}<br /> 0x20: The boy gives you his snowboard {SNMIN1/boy/s1}<br /> 0x40: Glacier Map Key Item {SNMIN2/dscvmap/s4}<br /> 0x80: First time you do Snowboard {SNOW/playgam/s2}<br />
|-
| style="background: rgb(255,205,154)" | 0x0C27<br />z_16[3]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Field mask ([[Bit_numbering|LBS]])(applied when you take the item).<br /> Bit=0(Item in field), Bit=1(Item taken).<br /> 0x01: If you succeed climbing (to the top, not the cave, just before crater_1 map) {GAIA_32/ladd5/s4}<br /> 0x02: If you Push-over the rock {GAIIN_2/icerock/s1}<br /> 0x04: Ice Pillar 1 down {GAIIN_5/turara1/s3}<br /> 0x08: Ice Pillar 2 down {GAIIN_5/turara2/s3}<br /> 0x10: Ice Pillar 3 down {GAIIN_5/turara3/s3}<br /> 0x20: Ice Pillar 4 down {GAIIN_5/turara4/s3}<br /> 0x40: First time you enter Holzoff's house(2nd room) / If you collaps at the Great Glacier {HOLU_2/drctr/s0}<br /> 0x80: History about Yamski and mini Cliff tutorial {HOLU_1/drctr/s0}<br />
|-
| style="background: rgb(255,205,154)" | 0x0C28<br />z_16[4]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Field mask ([[Bit_numbering|LBS]])(applied when you take the item).<br /> Bit=0(Item in field), Bit=1(Item taken).<br /> 0x01: First time you enter GAIAFOOT map talk {GAIAFOOT/drctr/s0}<br /> 0x02: <br /> 0x04: Tifa ask you take her with you {CRATER_2/drctr/s0}<br /> 0x08: Rufus finds the crater {TRNAD_2/hikutei/s2}<br /> 0x10: Sephiroth: "This is the end...for all of you" then his body vanish {TRNAD_4/discver/s2}<br /> 0x20: <br /> 0x40: Sephiroth illusion Nibelheim{WOA_3/gonivl1,gonivl2,gonivl3/s2}<br /> 0x80: First time cloud enter map crater_1 and talk about meteor and the crater {CRATER_1/drctr/s0}<br />
|-
| style="background: rgb(255,205,154)" | 0x0C29<br />z_16[5]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Field mask, Whirlwind Maze ([[Bit_numbering|LBS]])(applied when you take the item).<br /> Bit=0(Item in field), Bit=1(Item taken).<br /> 0x01: If you give the Black Materia to Barret {TRNAD_1/ballet/s1}<br /> 0x02: If you give the Black Materia to {TRNAD_1/red/s1}<br /> 0x04: Entrust the Black Materia {TRNAD_1/ballet/s1}<br /> 0x08: Tifa tells you need to cross when the wind is calm {WOA_1/setume3/s2}<br /> 0x10: 12 Black Cape man down {TRNAD_3/drctr/s0}<br /> 0x20: Black Cape man down {WOA_1/drctr/s0}<br /> 0x40: Black Cape man down {CRATER_1/blkdown/s4}<br /> 0x80: Black Cape man jump off {TRNAD_2/drctr/s0}<br />
|-
| style="background: rgb(255,205,154)" | 0x0C2A<br />z_16[6]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Field mask, Whirlwind Maze ([[Bit_numbering|LBS]])(applied when you take the item).<br /> Bit=0(Item in field), Bit=1(Item taken).<br /> 0x01: Cloud: "What happened to this town? It's so run-down" {UJUNON1/drctr/s0}<br /> 0x02: If you have taken the Glacier Map before he offers you to, man3: "What nerve! You already tore down the map."<br /> 0x04: Screen shake then Random Battle{GAIIN_6/drctr/s0}<br /> 0x08: Shiva Summon in Priscilla's house {PRISILA/sivamt/s1}<br /> 0x10: Black Cape man: "Ughâ¦ Errgaahh!!" {GAIIN_6/drctr/s0}<br /> 0x20: oldm1: "What? Cloud is missing?" {UJUNON1/oldm1/s1}<br /> 0x40: Prisila/Tifa talk about at prisila's house while cloud is missing in lifestream {PRISILA/prisl/s1}<br /> 0x80: Prisila/Cloud Talk at prisila's house after lifestream {PRISILA/drctr/s0}<br />
|-
| style="background: rgb(255,205,154)" | 0x0C2B<br />z_16[7]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Field mask, Whirlwind Maze ([[Bit_numbering|LBS]])(applied when you take the item).<br /> Bit=0(Item in field), Bit=1(Item taken).<br /> 0x01: Cid regets about gaving the Huge Materia to the Shinra {NCOREL/worry/s2}<br /> 0x02: After Barret finish talking about his hometown history then enters the ropeway {ROPEST/ad/S3}<br /> 0x04: Cid tell Prisila they have found Cloud {PRISILA/prisl/s1}<br /> 0x08: <br /> 0x10: <br /> 0x20: <br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0C44<br />z_16[32]
| 1 byte
|
Progress items, Wallmarket ([[Bit_numbering|LBS]]).<br />Bit=0(Item not obtained), Bit=1(Item obtained).<br /> 0x01: Cologne at Wallmarket {mktpb/woman2/s1}<br /> 0x02: Flower Cologne at Wallmarket {mktpb/woman2/s1}<br /> 0x04: Sexy Cologne at Wallmarket {mktpb/woman2/s1}<br /> 0x08: Wig at Wallmarket {mkt_mens}<br /> 0x10: Dyed Wig at Wallmarket {mkt_mens}<br /> 0x20: Blonde Wig at Wallmarket {mkt_mens}<br /> 0x40: Pharmacy coupon at Wallmarket {mkt_s2/line01/s3}<br /> 0x80: Obtained any Wig at Wallmarket {mkt_mens/event/s1}<br />
|-
| style="background: rgb(255,205,154)" | 0x0C45<br />z_16[33]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Progress items, Wallmarket ([[Bit_numbering|LBS]]).<br />Bit=0(Item not obtained), Bit=1(Item obtained).<br /> 0x01: Girl at Honey Bee Inn put make-up on cloud, poor result (result is random) {onna2/girl1/s3}<br /> 0x02: Girl at Honey Bee Inn put make-up on cloud, averange result (result is random) {onna2/girl1/s3}<br /> 0x04: Girl at Honey Bee Inn put make-up on cloud, best result (result is random) {onna2/girl1/s3}<br /> 0x08: Obtaining the dress at Wallmarket {mkt_s1/event/s2}<br /> 0x10: Dress selected (clean/soft,shiny/shimmers) {mktpb/oldm3/s1}<br /> 0x20: Cotton Dress [0xCA] {mktpb/oldm3/s1}<br /> 0x40: Satin Dress [0xAA] {mktpb/oldm3/s1}<br /> 0x80: Silk Dress [0x9A] {mktpb/oldm3/s1}<br />
|-
| style="background: rgb(255,205,154)" | 0x0C46<br />z_16[34]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Progress items, Wallmarket ([[Bit_numbering|LBS]]).<br />Bit=0(Item not obtained), Bit=1(Item obtained).<br /> 0x01: Disinfectant at Wallmarket {mkt_s3/tensyu}<br /> 0x02: Deodorant at Wallmarket {mkt_s3/tensyu}<br /> 0x04: Digestive at Wallmarket {mkt_s3/tensyu}<br /> 0x08: Materia shop owner ask you to get something from the inn vending machine {MKT_M/tensyu/s1}<br /> 0x10: 200 gil Item at vending machine in Wallmarket {mktinn/cloud/s4}<br /> 0x20: 100 gil Item at vending machine in Wallmarket {mktinn/cloud/s4}<br /> 0x40: 50 gil Item at vending machine in Wallmarket {mktinn/cloud/s4}<br /> 0x80: Boutique owner's son ask you to bring his father back from bar {mkt_s1/man1/s8}<br />
|-
| style="background: rgb(255,205,154)" | 0x0C47<br />z_16[35]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Ms. Cloud Bauty level (Don Corneo choice) (0 to 25 Points)<br />1 Point: Cotton Dress, Wig, Glass Tiara, Cologne, Poor Make-Up<br /> 3 Points: Satin Dress, Dyed Wig, Ruby Tiara, Flower Cologne, Averange Make-Up <br /> 5 Points: Silk Dress, Blonde Wig, Diamond Tiara, Sexy Cologne, Best Make-Up<br /> Unfinished Calc Script for this items (Not taken into account by point calc): <br /> Lingerie (Should be +1), Mystery panties (+3), Bikini briefs (+5) <br /> 2 to 11 Points: Choose Tifa<br /> 12 to 18 Points: Choose Aerith<br /> 19 or more Points: Choose Cloud<br />
|-
| style="background: rgb(255,205,154)" | 0x0C48<br />z_16[36]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Field Objects, Sector 7 Train Graveyard ([[Bit_numbering|LBS]]) (so far)<br />Bit=0(Original Position), Bit=1(Moved).<br /> 0x01: Train 1 Position. {mds7st2}<br /> 0x02: Train 2 Position. {mds7st2}<br /> 0x04: Train 3 Position. {mds7st2}<br /> 0x08, 0x10, 0x20, 0x40, 0x80: Unused<br />
|-
| style="background: rgb(255,205,154)" | 0x0C49<br />z_16[37]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Field Items, Sector 7 Wall Market<br />Items bit mask ([[Bit_numbering|LBS]])<br /> 0x01: Cloud see the first battery holder and figured out the idea of using a battery there... {wcrimb_1}<br /> 0x02: First battery applied up the wall of Wallmarket(0x02){wcrimb_1}<br /> 0x04: Second battery applied up the wall of Wallmarket(0x04){wcrimb_1}<br /> 0x08: <br /> 0x10: Third battery applied and Ether obtained up the wall of Wallmarket (0x10){wcrimb_2}<br /> 0x20: Battery (Gun shop batery pack 1/3){MKT_W/oyaji02/s1}<br /> 0x40: Battery (Gun shop batery pack 2/3){MKT_W/oyaji02/s1}<br /> 0x80: Battery (Gun shop batery pack 3/3){MKT_W/oyaji02/s1}<br /> Note: all 3 batteries get at same time.
|-
| style="background: rgb(255,205,154)" | 0x0C4A<br />z_16[38]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" | Number of Fort Condor Battles Fought<br />
|-
| style="background: rgb(255,205,154)" | 0x0C4B<br />z_16[39]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" | Number of Fort Condor Battles Won<br />
|-
| style="background: rgb(255,205,154)" | 0x0C4C<br />z_16[40]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Progress, Fort Condor<br />0x01: Oldman sited ask your help to protect the Condor [0x01] {convil_1/event/s13}<br /> 0x02: If 0x01 &amp;Cloud join them to fight Shinra [0x03] {convil_1/cloud/s18}<br /> 0x04: If 0x02 &amp; you talk him again: [0x07] {convil_1/event/s15}<br /> A) He tells you he already talk to the store owners to sell you items.<br /> B) He let you rest for free.<br /> 0x08: When set they tell you that there are no more shinra troops to fight[0x0F] {convil_2/event/s4}<br /> 0x10: Banished from Fort Condor after loosing the Huge Materia Boss Fight: Party talk {convil_2/event/s11}--&gt;{condor2/init/s0}--&gt;{condor2/event/s3}<br /> 0x20: Phoenix Materia (Then Condor fly) {convil_4/ph_mat/s1}<br /> 0x40: Condor Born movie() {convil_2/event/s11}<br /> 0x80: Banished from Fort Condor after loosing the Huge Materia Boss Fight: Cutted rope {convil_2/event/s11}--&gt;{condor2/init/s0}<br />
|-
| style="background: rgb(255,205,154)" | 0x0C4D<br />z_16[41]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Battle Rank (Battle difficulty), Fort Condor<br />01: Rank 1 (Battles 1-3)<br /> 02: Rank 2 (Battles 4-6)<br /> 03: Rank 3 (Battles 7-9)<br /> 04: Rank 4 (Battles 10-12)<br /> 05: Rank 5 (Battles 13+)<br /> 06: Rank 6 (Huge Materia battle)<br /> The Battle Rank set the number of enemies. Fire Catapults enabled from Rank 2, and Tristoners from Rank 3.
|-
| style="background: rgb(255,205,154)" | 0x0C4E<br />z_16[42]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Number of Allies left, Fort Condor<br />The number of surviving allies units. (The ones that you give in exchange for gil)<br />
|-
| style="background: rgb(255,205,154)" | 0x0C4F<br />z_16[43]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" | Number of Enemies killed, Fort Condor<br />
|-
| style="background: rgb(255,205,154)" | 0x0C50<br />z_16[44]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Battle result, Fort Condor<br />00: If you win the battle<br /> 01: If you lose the battle
|-
| style="background: rgb(255,205,154)" | 0x0C51<br />z_16[45]
| style="background: rgb(225,236,252)" | 2 bytes
| style="background: rgb(225,236,252)" |
Game Progres Temp Var, Fort Condor {convil_4/mihari/s1}<br />When the battle ends, the Game Progres Var (0x0BA4) is copied to this Var.<br /> Is used to check the progresion diff to trigger the new attack event.
|-
| style="background: rgb(255,205,154)" | 0x0C53<br />z_16[47]
| style="background: rgb(225,236,252)" | 1 bytes
| style="background: rgb(225,236,252)" |
Number of Enemies left alive in the battle field, Fort Condor <br />Set by kernel, not referenced by the field script.
|-
| style="background: rgb(255,205,154)" | 0x0C54<br />z_16[48]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Progress, Fort Condor<br />00: No battle<br /> 01: Normal Battle<br /> 03: Final Boss Battle<br />
|-
| style="background: rgb(255,205,154)" | 0x0C55<br />z_16[49]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Progress &amp; Battle Reward, Fort Condor<br />0x01: Condor Progress {convil_1/jijii/s1}<br /> 0x02: Condor Progress {convil_1/mihari/s1}{convil_2/mihari/s1}{convil_4/ph_mat/s1}<br /> 0x04: Condor Progress {convil_1/event/s19}<br /> 0x08: Condor Progress {convil_2/mihari/s1}<br /> 0x10: "Received "Magic Comb"!" {convil_2/itemget/s1}<br /> 0x20: "Received "Peace Ring"!" {convil_2/itemget/s1}<br /> 0x40: "Received "Megalixir"!" {convil_2/itemget/s1}<br /> 0x80: "Received "Super Ball"!" {convil_2/itemget/s1}<br />
|-
| style="background: rgb(255,205,154)" | 0x0C56<br />z_16[50]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Progress, Fort Condor<br />0x01: <br /> 0x02: If you ever entered the {condor1} map<br /> 0x04: If you are inside the Fort<br /> 0x08: <br /> 0x10: <br /> 0x20: <br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0C57<br />z_16[51]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Battle modifier linked with 0x0C4D, Fort Condor<br />0x01: If 0x0C4D &gt;= 2 is set to 1 {convil_2/event/s7}<br /> 0x02: If 0x0C4D &gt;= 3 is set to 1 {convil_2/event/s7}<br /> 0x04: <br /> 0x08: <br /> 0x10: <br /> 0x20: <br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0C58<br />z_16[52]
| style="background: rgb(255,255,204)" | 2 bytes
| style="background: rgb(255,255,204)" | Fort Condor Funds
|-
| style="background: rgb(255,205,154)" | 0x0C5A<br />z_16[54]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" | Number of Fort Condor Battles Lost<br />
|-
| style="background: rgb(255,205,154)" | 0x0C5B<br />z_16[55]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Conversations mask ([[Bit_numbering|LBS]])(applied when you speak).<br />Bit=0(Not spoken to), Bit=1(Spoken to).<br /> 0x01: Speaking to the children near the wall of Wallmarket(0x01)<br /> 0x02: Speaking to the children near the wall of Wallmarket(0x02)<br /> 0x04: Conversation of children on top of the wall of Wallmarket(0x04)<br /> 0x08: Speaking to the child by the pipe in Wallmarket (0x08)<br /> 0x10: <br /> 0x20: <br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0C5C<br />z_16[56]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" | Handle the map jumps to MOVE_S(670),MOVE_I,MOVE_F,MOVE_R,MOVE_U,MOVE_D, Great Glacier<br />
|-
| style="background: rgb(255,205,154)" | 0x0C5D<br />z_16[57]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Progress, Great Glacier<br />0x01: To know if you came from the snowboard course (0=YES,1=NO), if so display the land event: "...So where did we land?..."{hyou2/event/s1}, "We've jumped pretty far..." {hyou3/event/s5}<br /> 0x02: To know if you came from the Glacier Map Screen, if so restore your position and set this bit to 0 {hyou1/init/s0}<br />
|-
| style="background: rgb(255,205,154)" | 0x0C5E<br />z_16[58]
| style="background: rgb(225,236,252)" | 2 byte
| style="background: rgb(225,236,252)" | Store Cloud MAPID, is used to know where to send you after seeing the Glacier Map, Great Glacier {hyoumap/init/s0}<br />
|-
| style="background: rgb(255,205,154)" | 0x0C60<br />z_16[60]
| style="background: rgb(225,236,252)" | 2 byte
| style="background: rgb(225,236,252)" | Store Cloud position (X) right before you use the map, Great Glacier<br />
|-
| style="background: rgb(255,205,154)" | 0x0C62<br />z_16[62]
| style="background: rgb(225,236,252)" | 2 byte
| style="background: rgb(225,236,252)" | Store Cloud position (Y) right before you use the map, Great Glacier<br />
|-
| style="background: rgb(255,205,154)" | 0x0C64<br />z_16[64]
| style="background: rgb(225,236,252)" | 2 byte
| style="background: rgb(225,236,252)" | Store Cloud position (Z) right before you use the map, Great Glacier<br />
|-
| style="background: rgb(255,205,154)" | 0x0C66<br />z_16[66]
| style="background: rgb(225,236,252)" | 2 byte
| style="background: rgb(225,236,252)" | Store Cloud position (triangle ID) right before you use the map, Great Glacier<br />
|-
| style="background: rgb(255,205,154)" | 0x0C68<br />z_16[68]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" | Store Cloud direction right before you use the map, then restore it from it, Great Glacier<br />
|-
| style="background: rgb(255,205,154)" | 0x0C69<br />z_16[69]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" | Is set to 1 when cloud pass-out, Great Glacier<br />
|-
| style="background: rgb(255,205,154)" | 0x0C6A<br />z_16[70]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Cloud Pass-out Counter, Great Glacier<br />First time you jump to HOLU_1(687), then to HOLU_2(688) <br />
|-
| style="background: rgb(255,205,154)" | 0x0C6B<br />z_16[71]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Progress &amp; Field item mask, Great Glacier<br />0x01: When you touch the hot spring (used to get Alexander Summon) {hyou10/event/s3}---&gt;{hyou10/cloud/s4,s5}<br /> 0x02: If you ever have spoken to snoww {hyou12/snoww/s1}<br /> 0x04: If you lose the battle against the Snow woman (snoww)<br /> 0x08: If you win the battle against the Snow woman<br /> 0x10: Received "Alexander" Materia{hyou13_2/mt/s1}<br /> 0x20: Received "Added Cut" Materia {MOVE_d/mt/s1}<br /> 0x40: Received "All" Materia {hyou12/mt/s1}<br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0C74<br />z_16[80]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Used to save user anwser in the debugroom {BLACKBG7/leave/s1} before Jump to map blin70_4 (No269)<br />00: Set along with GameProgress = 0<br /> 00: Set along with GameProgress = 1566<br /> 00: Set along with GameProgress = 1572<br />
|-
| style="background: rgb(255,205,154)" | 0x0C75<br />z_16[81]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" | Unknown is set to 0 in Wall Market {MRKT2/mapinit/s0}
|-
| style="background: rgb(255,205,154)" | 0x0C84<br />z_16[96]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" | Keeps track of which Shinra floors are unlocked (By picking keycards). Values still unknown.(255 all doors opened when set manualy)
|-
| style="background: rgb(255,255,204)" | 0x0C85
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" | Mission 1st reactor flags.<br />0x01: elevator on top floor.<br /> 0x08: 1st door opened.<br />0x10: 2nd door opened.<br />0x20: Jessie free from stuck.<br />0x40: bomb set.<br />0x80: set if time is out for gameover check.
|-
| style="background: rgb(255,255,204)" | 0x0C86
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" | Mission 1st reactor flags.<br />0x02: elevator door opened.<br />0x04: scrolled at map init to show reactor.
|-
| style="background: rgb(255,205,154)" | 0x0C87
| style="background: rgb(255,205,154)" | 29/45 bytes
| style="background: rgb(255,205,154)" | z_17 Unknown[0-28] First 29 bytes of 45 (ENDS AT 0x0CB3 16 Bytes into next bank)
|}

==  Save Memory Bank 3/4  ==

{| style="border: 1px solid black; border-collapse: collapse; width: 600px" border="1" cellspacing="1" cellpadding="3" align="center"
|+ '''Table 1: FF7 Save Slot'''
|-
! Offset
! Length
! Description
|-
| style="background: rgb(255,205,154)" | 0x0CA4
| style="background: rgb(255,205,154)" | 16/45 Bytes
| style="background: rgb(255,205,154)" | z_17 Unknown[29-44] Last 16 bytes of 45
|-
| style="background: rgb(255,205,154)" | 0x0CAD<br />z_17[9]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" |
1<sup>st</sup> party member char ID mirror.<small> Is a mirror of 0x04F8 (set from field module).</small><br />
|-
| style="background: rgb(255,205,154)" | 0x0CAE<br />z_17[10]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" |
2<sup>nd</sup> party member char ID mirror.<small> Is a mirror of 0x04F9 (set from field module).</small><br />
|-
| style="background: rgb(255,205,154)" | 0x0CAF<br />z_17[11]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" |
3<sup>ed</sup> party member char ID mirror.<small> Is a mirror of 0x04FA (set from field module).</small><br />
|-
| style="background: rgb(255,255,204)" | 0x0CB4
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" | Aeris In Church progression (document this better)
|-
| style="background: rgb(255,205,154)" | 0x0CB5
| style="background: rgb(255,205,154)" | 49 Bytes
| style="background: rgb(255,205,154)" | z_18 Unknown
|-
| style="background: rgb(255,255,204)" | 0x0CE6
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" | Escape from 1st reactor progress.<br />0x01: after scroll at start of map MD8_2 (maybe unneded).<br />0x02: after people panic on MD8_3 is over to never show it again.
|-
| style="background: rgb(255,205,154)" | 0x0CE7
| style="background: rgb(255,205,154)" | 7 Bytes
| style="background: rgb(255,205,154)" | z_19 Unknown
|-
| 0x0CEE
| 2 bytes
| Party GP (0-10000)
|-
| style="background: rgb(255,205,154)" | 0x0CF0
| style="background: rgb(255,205,154)" | 12 Bytes
| style="background: rgb(255,205,154)" | z_20 Unknown
|-
| style="background: rgb(255,205,154)" | 0x0CF0<br />z_20[0]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" | Chocobo Race - Times you lose (Only on Corel Prision Race){crcin/esto/s0}<br />
|-
| style="background: rgb(255,205,154)" | 0x0CF3 <br /> z_20[3]
| style="background: rgb(255,205,154)" | 1 Byte
| style="background: rgb(255,205,154)" | Battle Square Special Dialog Progression {0x00 init, 0x10 :no text, 0xF0:new special fight}
|-
| style="background: rgb(255,205,154)" | 0x0CF4 <br /> z_20[4] &amp; Z_20[5]
| style="background: rgb(255,255,204)" | 2 Bytes
| style="background: rgb(255,255,204)" | Battle Square Battle Points
|-
| 0x0CFC
| 1 byte
| Number of chocobo stables owned
|-
| 0x0CFD
| 1 byte
| Number of occupied stables
|-
| style="background: rgb(255,205,154)" | 0x0CFE
| style="background: rgb(225,236,252)" | 1 Byte
| style="background: rgb(225,236,252)" |
Choco Bill dialogs mask 0x01: If you talk him after meteor get summoned (only showed once) {FRMIN/jijii/s1}<br /> 0x02: If he offers you to rent Chocobo Stables (only showed once) {FRMIN/jijii/s1}<br />
|-
| 0x0CFF
| 1 byte
| Chocobo Stables Occupied Mask. LSB 1 2 3 4 5 6 x x MSB Stable #) Chocobo's in stables. 1=0ccupied
|-
| 0x0D00
| 1 byte
| Chocobos who can't mate LSB 1 2 3 4 5 6 x x MSB (Stable #).The Chocobo Was Just Born or has Recently Mated.1=can't mate
|-
| style="background: rgb(255,205,154)" | 0x0D01
| style="background: rgb(255,205,154)" | 40 Bytes
| style="background: rgb(255,205,154)" | z_22 Unknown
|-
| style="background: rgb(255,205,154)" | 0x0D13<br />z_22[18]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" | Aeris flower quest progress.<br />0x01: if we buy flower from Aeris.
|-
| style="background: rgb(255,205,154)" | 0x0D23<br />z_22[34]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" | Current room in TUNNEL_1. From 1 to 6. If less then 1 then we go to TUNNEL_3. If 6 then to TUNNEL_2. Used instead of duplicating tunnel rooms. Start room set during mission 5 reactor train minigame.
|-
| style="background: rgb(255,205,154)" | 0x0D24<br />z_22[35]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Conversations mask, Kalm ([[Bit_numbering|LBS]])(applied when you speak to someone).<br />Bit=0(Not spoken to), Bit=1(Spoken to).<br /> 0x01: <br /> 0x02: <br /> 0x04: <br /> 0x08: Spoke to the child in the house next to the Inn<br /> 0x10: Freed the dog in a house<br /> 0x20: <br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0D26<br />z_22[37]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Conversations mask, Reactor under the plate ([[Bit_numbering|LBS]])(applied when you speak).<br />Bit=0(Not spoken to), Bit=1(Spoken to).<br /> 0x01: Speaking with Biggs(0x01)<br /> 0x02: <br /> 0x04: <br /> 0x08: <br /> 0x10: <br /> 0x20: <br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0D27<br />z_22[38]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Conversations mask, Reactor under the plate ([[Bit_numbering|LBS]])(applied when you speak).<br />Bit=0(Not spoken to), Bit=1(Spoken to).<br /> 0x01: Speaking with Jesse(0x01)<br /> 0x02: <br /> 0x04: <br /> 0x08: <br /> 0x10: <br /> 0x20: <br /> 0x40: <br /> 0x80: <br />
|-
| 0x0D29
| 1 Byte
| Yuffie can be found in the forests? (LSB only) others used?
|-
| style="background: rgb(255,205,154)" | 0x0D2A
| style="background: rgb(255,205,154)" | 28 Bytes
| style="background: rgb(255,205,154)" | z_23 Unknown
|-
| style="background: rgb(255,205,154)" | 0x0D44<br />z_23[26]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Conversations mask, Reactor under the plate ([[Bit_numbering|LBS]]).<br />Bit=0(NOT Activated/Received/Spoken to), Bit=1(Activated/Received/Spoken to).<br /> 0x01: <br /> 0x02: <br /> 0x04: <br /> 0x08: <br /> 0x10: Aerith on roof event ends<br /> 0x20: <br /> 0x40: Turbo Ether {MIN51_2}<br /> 0x80: Aerith on roof event starts<br />
|-
| 0x0D46
| 1 byte
| Don's Mission Progress (more needed here)
|-
| style="background: rgb(255,205,154)" | 0x0D47
| style="background: rgb(255,205,154)" | 31 Bytes
| style="background: rgb(255,205,154)" | z_24 Unknown
|-
| style="background: rgb(255,205,154)" | 0x0D47<br />z_24[0]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Conversations mask, Shinra HQ ([[Bit_numbering|LBS]])(applied when you speak).<br />Bit=0(Not spoken to), Bit=1(Spoken to).<br /> 0x01: <br /> 0x02: <br /> 0x04: <br /> 0x08: Elevator event at shinra HQ(0x08)<br /> 0x10: First conversation while climbing Shinra HQ stairs(0x10)<br /> 0x20: <br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0D49<br />z_24[2]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Conversations mask, Shinra HQ ([[Bit_numbering|LBS]])(applied when you speak).<br />Bit=0(Not spoken to), Bit=1(Spoken to).<br /> 0x01: <br /> 0x02: <br /> 0x04: <br /> 0x08: <br /> 0x10: <br /> 0x20: <br /> 0x40: <br /> 0x80: Second conversation while climbing Shinra HQ stairs(0x80)<br />
|-
| style="background: rgb(255,205,154)" | 0x0D4A<br />z_24[3]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Conversations mask, Shinra HQ ([[Bit_numbering|LBS]])(applied when you speak).<br />Bit=0(Not spoken to), Bit=1(Spoken to).<br /> 0x01: Third conversation while climbing Shinra HQ stairs (0x01)<br /> 0x02: <br /> 0x04: <br /> 0x08: <br /> 0x10: <br /> 0x20: <br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0D4C<br />z_24[5]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Conversations mask, Shinra HQ ([[Bit_numbering|LBS]])(applied when you speak).<br />Bit=0(Not spoken to), Bit=1(Spoken to).<br /> 0x01: Braking in Shinra HQ scene (0x01)<br /> 0x02: Taking out the guards and obtaining keycard 60(0x02)<br /> 0x04: Taking everyone out the first floor in Shinra HQ(0x04)<br /> 0x08: Speaking to the couple in the shop at Shinra HQ(0x08)<br /> 0x10: Speaking to the shop seller in Shinra HQ(0x10)<br /> 0x20: Approaching Shinra HQ and conversation at the front door scene(0x20)<br /> 0x40: Approaching Shinra HQ and conversation at the front door scene(0x40)<br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0D50<br />z_24[9]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Items mask, Shinra HQ ([[Bit_numbering|LBS]])(applied when you speak).<br />Bit=0(Item on floor), Bit=1(Item taken).<br /> 0x01: Phoenix down from locker at floor 64 (0x01)<br /> 0x02: Ether from locker at floor 64(0x02)<br /> 0x04: <br /> 0x08: <br /> 0x10: Exiting elevator FMV at floor 60(0x10)<br /> 0x20: <br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0D52<br />z_24[11]
| style="background: rgb(255,255,204)" | 2 bytes
| style="background: rgb(255,255,204)" |
Bits kept for the doors at floor 63, Shinra HQ ([[Bit_numbering|LBS]])(applied when you speak).<br />Bit=0(Door opened), Bit=1(Door closed).<br />
|-
| style="background: rgb(255,205,154)" | 0x0D55<br />z_24[14]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Item mask, Shinra HQ ([[Bit_numbering|LBS]])(applied when you speak).<br />Bit=0(Item on floor), Bit=1(Item taken).<br /> 0x01: <br /> 0x02: Coupon C from Shinra HQ(0x02)<br /> 0x04: Coupon C from Shinra HQ(0x04)<br /> 0x08: Coupon B from Shinra HQ(0x08)<br /> 0x10: Speaking to the machine at floor 63(0x10)<br /> 0x20: <br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0D56<br />z_24[15]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Bits kept for some events on floor 63, Shinra HQ ([[Bit_numbering|LBS]])(Really needs to be investigated).<br />Bit=0(Door opened), Bit=1(Door closed).<br />
|-
| style="background: rgb(255,205,154)" | 0x0D57<br />z_24[16]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Conversations mask, Shinra HQ ([[Bit_numbering|LBS]])(applied when you speak).<br />Bit=0(Not spoken to), Bit=1(Spoken to).<br /> 0x01: Hitting vending machine at floor 64(0x01)<br /> 0x02: <br /> 0x04: <br /> 0x08: <br /> 0x10: <br /> 0x20: <br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0D58<br />z_24[17]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Conversations mask, Shinra HQ ([[Bit_numbering|LBS]])(applied when you speak).<br />Bit=0(Not spoken to), Bit=1(Spoken to).<br /> 0x01: <br /> 0x02: <br /> 0x04: <br /> 0x08: Placing midgar fifth part(0x08)<br /> 0x10: Placing midgar fourth part(0x10)<br /> 0x20: Placing midgar third part(0x20)<br /> 0x40: Placing midgar second part(0x40)<br /> 0x80: Placing midgar first part(0x80)<br />
|-
| style="background: rgb(255,205,154)" | 0x0D59<br />z_24[18]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Conversations mask, Shinra HQ ([[Bit_numbering|LBS]])(applied when you speak).<br />Bit=0(Not spoken to), Bit=1(Spoken to).<br /> 0x01: Midgar model lights up at floor 65<br /> 0x02: <br /> 0x04: <br /> 0x08: <br /> 0x10: <br /> 0x20: <br /> 0x40: <br /> 0x80: Last conversation with floor 63 machine<br />
|-
| style="background: rgb(255,205,154)" | 0x0D5D<br />z_24[22]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Conversations mask, Shinra HQ ([[Bit_numbering|LBS]])(applied when you speak).<br />Bit=0(Not spoken to), Bit=1(Spoken to).<br /> 0x01: <br /> 0x02: <br /> 0x04: <br /> 0x08: <br /> 0x10: <br /> 0x20: Retrieving coupons (must know the order)(0x20)<br /> 0x40: Retrieving coupons (must know the order)(0x40)<br /> 0x80: Retrieving coupons (must know the order)(0x80)<br />
|-
| 0x0D66
| 1 byte
|
Turtle Paradise Flyers Seen LSB 1 2 3 4 5 6 x x MSB (flyer#) 1=seen 0x01: Sector 7 Slums<br /> 0x02: 1st Floor Shinra Building<br /> 0x04: Gold Saucer - Ghost Hotel<br /> 0x08: Cosmo Canyon - Inn 2nd Floor<br /> 0x10: Cosmo Canyon - Near Shop<br /> 0x20: Wutai In Front of Trap Room<br /> 0x40: Wutai - In Front of Turtle Paradise<br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0D67
| style="background: rgb(255,205,154)" | 12 Bytes
| style="background: rgb(255,205,154)" | z_25 Unknown
|-
| style="background: rgb(255,205,154)" | 0x0D67<br />z_25[0]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Conversations mask<br />0x01: Cait Sith Leaves, and tell you that "The Sister Ray's not this way" {SINBIL_1/KETLINE/s5}<br /> 0x02: Don Corneo's mansion first time you talk to DOORMAN {colne_1/DOORMAN/s1}<br /> 0x04: <br /> 0x08: <br /> 0x10: <br /> 0x20: <br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0D68<br />z_25[1]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Northern Cave: Cloud Lv just before Jenova Synthesis battle start.<br />Used as lv placeholder for Jenova Synthesis Boost formula.
|-
| style="background: rgb(255,205,154)" | 0x0D69<br />z_25[2]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" | Northern Cave: Barret Lv just before Jenova Synthesis battle start.<br />
|-
| style="background: rgb(255,205,154)" | 0x0D6A<br />z_25[3]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" | Northern Cave: Tifa Lv just before Jenova Synthesis battle start.<br />
|-
| style="background: rgb(255,205,154)" | 0x0D6B<br />z_25[4]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" | Northern Cave: Red XII Lv just before Jenova Synthesis battle start.<br />
|-
| style="background: rgb(255,205,154)" | 0x0D6C<br />z_25[5]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" | Northern Cave: Yuffie Lv just before Jenova Synthesis battle start.<br />
|-
| style="background: rgb(255,205,154)" | 0x0D6D<br />z_25[6]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" | Northern Cave: Cait Sith Lv just before Jenova Synthesis battle start.<br />
|-
| style="background: rgb(255,205,154)" | 0x0D6E<br />z_25[7]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" | Northern Cave: Vincent Lv just before Jenova Synthesis battle start.<br />
|-
| style="background: rgb(255,205,154)" | 0x0D6F<br />z_25[8]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" | Northern Cave: Cid Lv just before Jenova Synthesis battle start.<br />
|-
| style="background: rgb(255,205,154)" | 0x0D70<br />z_25[9]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Bizarro Sephiroth Fight Number of Groups<br />01: 1 Group. First time you enter the map{LASTMAP/directr/s0}<br /> 02: 2 Groups {LASTMAP/AD3/s3}<br /> 03: 3 Groups {LASTMAP/AD3/s3}<br />
|-
| style="background: rgb(255,205,154)" | 0x0D71<br />z_25[10]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Bizarro Sephiroth Fight, some progress value<br />00: {LASTMAP/BAT/s4,s5}<br /> 01: {LASTMAP/BAT/s4}<br /> 02: {LASTMAP/BAT/s4}<br /> 03: {LASTMAP/BAT/s5}<br /> 04: {LASTMAP/BAT/s5}<br /> 05: {LASTMAP/BAT/s5}<br /> 06: {LASTMAP/BAT/s5}<br />
|-
| style="background: rgb(255,205,154)" | 0x0D72<br />z_25[11]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Great Glacier Snowboard, taken path (Set the exit location where you land) {hyou1/event/s1}<br />0x01: Left both times: Forest HYOU2<br /> 0x02: Right both times: Outside Frostbite cave HYOU3<br /> 0x04: Left right: Main gate HYOU1<br /> 0x08: Right then left: Single tree HYOU7<br />
|-
| 0x0D73
| 1 byte
| Yuffie Regulary. Has the character entered the party regulary? For example Yuffie further appears in the forest if this option is off.<br />0x6E: Yes; 0x6F: No
|-
| style="background: rgb(255,205,154)" | 0x0D74
| style="background: rgb(255,205,154)" | 15 Bytes
| style="background: rgb(255,205,154)" | z_26 Unknown
|-
| style="background: rgb(255,205,154)" | 0x0D74<br />z_26[0]
| style="background: rgb(255,163,0)" | 1 byte
| style="background: rgb(255,163,0)" |
MDS7PLR1 event flags.<br />0x01: when everyone run to hideout.<br /> 0x02: when talk to man to view pillar to call. This will run special event script when return to this map. Remove this bit after script is called.<br /> 0x04: when Barret return to map and call us again.<br /> 0x08: after return to this map after seeing pillar.<br /> 0x10: after talking to right soldier twice (before mission in 5th reactor).<br /> 0x20: <br /> 0x40: <br /> 0x80:
|-
| style="background: rgb(255,205,154)" | 0x0D75<br />z_26[1]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Conversations mask, MDS7 ([[Bit_numbering|LBS]])(applied when you speak).<br />Bit=0(Not spoken to), Bit=1(Spoken to). The value inside [] is the hex value of the entire byte.<br /> Start sector 7 slums [0x00]<br /> 0x01: Right after enter s7 bar MAP[0xA1]<br /> 0x02: After 7th heaven initial scene[0xFF]or[0xBF] if bit 6 is 0<br /> 0x04: Tifa get out the bar[0xA5]?<br /> 0x08: Scene ends and barret wait outside bar[0xAD]<br /> 0x10: Barret talk before enter the bar[0xFD]or[0xBD] if bit 6 is 0<br /> 0x20: Right after enter s7 bar MAP[0xA1]<br /> 0x40: Girl talk about reactor explotion[0xED]<br /> 0x80: Right after enter s7 bar MAP[0xA1]<br />
|-
| style="background: rgb(255,205,154)" | 0x0D76<br />z_26[2]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Conversations mask, MDS7 ([[Bit_numbering|LBS]])(applied when you speak).<br />Bit=0(Not spoken to), Bit=1(Spoken to). The value inside [] is the hex value of the entire byte.<br /> Start sector 7 slums [0x00]<br /> 0x01: After you wake up in the Hideout[0x03]<br /> 0x02: After you wake up in the Hideout[0x03]<br /> 0x04: Unknown[0x00]?<br /> 0x08: Unknown[0x00]<br /> 0x10: Avalache member continue running to s7 train station and Villagers are arround Avalache team [0x51]{mds7}<br /> 0x20: Unknown it become 1 seconds after 0x0D76[4] is set [0x51]{mds7}<br /> 0x40: Unknown[0x00]<br /> 0x80: Unknown[0x00]<br />
|-
| style="background: rgb(255,205,154)" | 0x0D77<br />z_26[3]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Conversations mask, MDS7 ([[Bit_numbering|LBS]])(applied when you speak).<br />Bit=0(Not spoken to), Bit=1(Spoken to). The value inside [] is the hex value of the entire byte.<br /> Start sector 7 slums [0x00]<br /> 0x01: Tell tifa did fight w/ barret (1) didn't fight (0)[0x05]or[0x04] if not<br /> 0x02: Unknown[0x00]<br /> 0x04: Auto tifa talk about fight w/ barret[0x04]<br /> 0x08: Unknown[0x00]<br /> 0x10: Unknown[0x00]<br /> 0x20: Unknown[0x00]<br /> 0x40: Unknown[0x00]<br /> 0x80: Unknown[0x00]<br />
|-
| style="background: rgb(255,205,154)" | 0x0D78<br />z_26[4]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Conversations mask, MDS7 ([[Bit_numbering|LBS]])(applied when you speak).<br />Bit=0(Not spoken to), Bit=1(Spoken to). The value inside [] is the hex value of the entire byte.<br /> Start sector 7 slums [0x00]<br /> 0x01: Barret chages in bar (set w/ z_26[1] state #2)[0x03]<br /> 0x02: Barret chages in bar (set w/ z_26[1] state #2)[0x03]<br /> 0x04: After we have talked to tifa[0x07]<br /> 0x08: Set to 1 if we choose no drink when talking to tifa[0x0F]<br /> 0x10: Set to 1 if we choose strong drink talking ot tifa[0x17]<br /> 0x20: Unknown[0x00]<br /> 0x40: Unknown[0x00]<br /> 0x80: Unknown[0x00]<br />
|-
| style="background: rgb(255,205,154)" | 0x0D79<br />z_26[5]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Conversations mask, MDS7 ([[Bit_numbering|LBS]])(applied when you speak).<br />Bit=0(Not spoken to), Bit=1(Spoken to). The value inside [] is the hex value of the entire byte.<br /> Start sector 7 slums [0x00]<br /> 0x01: set to 1 when tifa calls the machine down after you 1st talk down stairs, never gets unset[0x03]<br /> 0x02: 1 if elevator is in hide out (pinball machine)[0x02]<br /> 0x04: After you wake up in the Hideout[0x1F]<br /> 0x08: After you wake up in the Hideout[0x1F]<br /> 0x10: After you wake up in the Hideout[0x1F]<br /> 0x20: Unknown[0x00]<br /> 0x40: After giving Barret the materia tutorial[0x5D]<br /> 0x80: Unknown[0x00]<br />
|-
| style="background: rgb(255,205,154)" | 0x0D7A<br />z_26[6]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Conversations mask, MDS7 ([[Bit_numbering|LBS]])(applied when you speak).<br />Bit=0(Not spoken to), Bit=1(Spoken to). The value inside [] is the hex value of the entire byte.<br /> Start sector 7 slums [0x00]<br /> 0x01: After hide out 1st talk[0x03]<br /> 0x02: After hide out 1st talk[0x03]<br /> 0x04: second part of talk tifa enter in scene[0x07]<br /> 0x08: After you wake up in the Hideout[0x6F]<br /> 0x10: Unknown[0x00]<br /> 0x20: After you wake up in the Hideout[0x6F]<br /> 0x40: After you wake up in the Hideout[0x6F]<br /> 0x80: After you get out the Hideout and talk to tifa [0xEF]<br />
|-
| style="background: rgb(255,205,154)" | 0x0D7B<br />z_26[7]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Items mask, Training room at sector 5 ([[Bit_numbering|LBS]])(applied when you speak).<br />Bit=0(Item on floor), Bit=1(Item taken).<br /> 0x01: <br /> 0x02: <br /> 0x04: <br /> 0x08: <br /> 0x10: All materia after taking ether(0x10)<br /> 0x20: Ether chest that falls from ceiling(0x20)<br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0D7C<br />z_26[8]
| style="background: rgb(255,163,0)" | 1 byte
| style="background: rgb(255,163,0)" |
MDS7ST3 event flags.<br />0x01: when everyone start run to hideout.<br /> 0x02: when trainman tells you about war (3 talk).<br /> 0x04: when pair on station agreed with each other.<br /> 0x08: when Jessie, Biggs and Wedge run into train.<br /> 0x10: <br /> 0x20: <br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,255,204)" | 0x0D83
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" | Midgard train flags.<br />0x01: when we talk to Biggs on way to sector 7.<br />0x02: when we talk to Wedge twice on way to sector 7.<br />0x04: when talk to Jessie, before look at map.<br />0x10: this bit is checked on ROOTMAP, though it doesn't use ingame.
|-
| style="background: rgb(255,205,154)" | 0x0D84
| style="background: rgb(255,205,154)" | 32/64 Bytes
| style="background: rgb(255,205,154)" | z_27 Unknown[0-31] First 32 bytes of 64 (ENDS AT 0x0DC3 32 Bytes into next bank)
|-
| style="background: rgb(255,205,154)" | 0x0D90<br />z_27[12]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Event flags inside Junon.<br />0x01: <br /> 0x02: <br /> 0x04: Junon Soldiers running through the city after the parade.<br /> 0x08: <br /> 0x10: <br /> 0x20: Enemy Skill materia<br /> 0x40: <br /> 0x80: <br />
|}

==  Save Memory Bank B/C  ==

{| style="border: 1px solid black; border-collapse: collapse; width: 600px" border="1" cellspacing="1" cellpadding="3" align="center"
|+ '''Table 1: FF7 Save Slot'''
|-
! Offset
! Length
! Description
|-
| style="background: rgb(255,205,154)" | 0x0DA4
| style="background: rgb(255,205,154)" | 32/64 Bytes
| style="background: rgb(255,205,154)" | z_27 Unknown[32-63] Last 32 bytes of 64
|-
| style="background: rgb(255,205,154)" | 0x0DA4<br />z_27[32]
| style="background: rgb(205,230,230)" | 6 bytes
| style="background: rgb(205,230,230)" |
Chocobo Race - Chocobo Name ([[FF7/FF_Text|FF Text format]])
|-
| style="background: rgb(255,205,154)" | 0x0DAA<br />z_27[38]
| style="background: rgb(205,230,230)" | 1 bytes
| style="background: rgb(205,230,230)" |
Chocobo Race(G1) - Jockey<br />00: Cloud<br /> 01: Tifa<br /> 02: Cid<br />
|-
| style="background: rgb(255,205,154)" | 0x0DAB<br />z_27[39]
| style="background: rgb(205,230,230)" | 1 bytes
| style="background: rgb(205,230,230)" |
Chocobo Race(G1) - Course<br />00: Long course<br /> 01: Short course<br />
|-
| style="background: rgb(255,205,154)" | 0x0DAC<br />z_27[40]
| style="background: rgb(205,230,230)" | 1 bytes
| style="background: rgb(205,230,230)" |
Chocobo Race(G1) - Bet Selection Screen<br />00: Enabled {crcin_1/esto}<br /> 01: Disabled {crcin_2/esto}<br />
|-
| style="background: rgb(255,205,154)" | 0x0DAD<br />z_27[41]
| style="background: rgb(205,230,230)" | 1 bytes
| style="background: rgb(205,230,230)" |
Chocobo Race(G1) - ???<br />00: All others times but<br /> 01: When you race by talking to ester in {crcin_1/esto}<br />
|-
| style="background: rgb(255,205,154)" | 0x0DAE<br />z_27[42]
| style="background: rgb(205,230,230)" | 2 bytes
| style="background: rgb(205,230,230)" |
Chocobo Race(G2) - Sprint Speed<br />Value = 4500 {crcin_2}<br />
|-
| style="background: rgb(255,205,154)" | 0x0DB0<br />z_27[44]
| style="background: rgb(205,230,230)" | 2 bytes
| style="background: rgb(205,230,230)" |
Chocobo Race(G2) - Speed<br />Value = 3500 {crcin_2}<br />
|-
| style="background: rgb(255,205,154)" | 0x0DB2<br />z_27[46]
| style="background: rgb(205,230,230)" | 1 byte
| style="background: rgb(205,230,230)" |
Chocobo Race(G2) - Acceleration<br />Value = 70 {crcin_2}<br />
|-
| style="background: rgb(255,205,154)" | 0x0DB3<br />z_27[47]
| style="background: rgb(205,230,230)" | 1 byte
| style="background: rgb(205,230,230)" |
Chocobo Race(G2) - Cooperation<br />Value = 100 {crcin_2}<br />
|-
| style="background: rgb(255,205,154)" | 0x0DB4<br />z_27[48]
| style="background: rgb(205,230,230)" | 1 byte
| style="background: rgb(205,230,230)" |
Chocobo Race(G2) - Intelligence<br />Value = 100 {crcin_2}<br />
|-
| style="background: rgb(255,205,154)" | 0x0DB5<br />z_27[49]
| style="background: rgb(205,230,230)" | 1 byte
| style="background: rgb(205,230,230)" |
Chocobo Race(G2) - Type (Yellow, Green, Blue, Black, Gold)<br />Value = 0 {crcin_2}<br />
|-
| style="background: rgb(255,205,154)" | 0x0DB6<br />z_27[50]
| style="background: rgb(205,230,230)" | 1 byte
| style="background: rgb(205,230,230)" |
Chocobo Race(G2) - Personality<br />Value = 0 {crcin_2}<br />
|-
| style="background: rgb(255,205,154)" | 0x0DB7<br />z_27[51]
| style="background: rgb(205,230,230)" | 1 byte
| style="background: rgb(205,230,230)" |
Chocobo Race(G2) - ???<br />05: When you race by talking to ester in {crcin_2/esto}<br /> 07: All others times {crcin_1/esto}<br />
|-
| style="background: rgb(255,205,154)" | 0x0DB8<br />z_27[52]
| style="background: rgb(205,230,230)" | 1 byte
| style="background: rgb(205,230,230)" |
Chocobo Race(G2) - ???<br />Value = 1 (ALWAYS) {crcin_1/crcin_2}<br />
|-
| style="background: rgb(255,205,154)" | 0x0DB9<br />z_27[53]
| style="background: rgb(205,230,230)" | 1 byte
| style="background: rgb(205,230,230)" |
Chocobo Race(G2) - ???<br />Value = 0 (ALWAYS) {crcin_1/crcin_2}<br />
|-
| style="background: rgb(255,205,154)" | 0x0DBA<br />z_27[54]
| style="background: rgb(205,230,230)" | 1 byte
| style="background: rgb(205,230,230)" |
Chocobo Race(G2) - Joe/TEIOH Chalenge<br />00: No <br /> 01: Yes <br />
|-
| style="background: rgb(255,205,154)" | 0x0DBB<br />z_27[55]
| style="background: rgb(205,230,230)" | 1 byte
| style="background: rgb(205,230,230)" |
Chocobo Race(G2) - Selected Rank<br />00: Class C<br /> 01: Class B<br /> 02: Class A<br /> 03: Class S<br />
|-
| style="background: rgb(255,205,154)" | 0x0DBC<br />z_27[56]
| style="background: rgb(205,230,230)" | 1 byte
| style="background: rgb(205,230,230)" |
Chocobo Race - ???<br />Random 0/15{crcin_1/esto}<br /> 0: All others times
|-
| style="background: rgb(255,205,154)" | 0x0DBD<br />z_27[57]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Chocobo Race - Finish Place (0 to 5)<br />Set to 0xFF on the elevator {GLDELEV/dic/s0}<br /> Used only when you must race to get out the desert prision. After winning the race and before exit the map is set to 0xFF and never change again. {crcin/esto/s0}<br />
|-
| style="background: rgb(255,205,154)" | 0x0DBE<br />z_27[58]
| style="background: rgb(205,230,230)" | 2 bytes
| style="background: rgb(205,230,230)" |
Chocobo Race(G2) - Stamina<br />Value = 6000 {crcin_2}<br />
|-
| style="background: rgb(255,205,154)" | 0x0DC0<br />z_27[60]
| style="background: rgb(205,230,230)" | 1 bytes
| style="background: rgb(205,230,230)" |
Chocobo Race(G1) - Winning Prize<br />00 = 500GP | "Received "Sprint Shoes"<br /> 01 = 300GP | "Received "Counter Attack" Materia!!"<br /> 02 = 500GP | "Received "Magic Counter"<br /> 03 = 300GP | "Received "Precious Watch"!!"<br /> 04 = 500GP | "Received "Cat's Bell"!!"<br /> 05 = 300GP | "Enemy Away" Materia!!"<br /> 06 = 300GP | "Received "Sneak Attack" Materia!!"<br /> 07 = 400GP | "Received "Chocobracelet"!!"<br /> 08 = 30GP | "Received "Ether"!!"<br /> 09 = 200GP | "Received "Elixir"!!"<br /> 10 = 15GP | "Received "Hero Drink"!!"<br /> 11 = 20GP | "Received "Bolt Plume"!!"<br /> 12 = 20GP | "Received "Fire Fang"!!"<br /> 13 = 20GP | "Received "Antarctic Wind"!!"<br /> 14 = 50GP | "Received "Swift Bolt"!!"<br /> 15 = 50GP | "Received "Fire Veil"!!"<br /> 16 = 50GP | "Received "Ice Crystal"!!"<br /> 17 = 300GP | "Received "Megalixir"!!"<br /> 18 = 150GP | "Received "Turbo Ether"!!"<br /> 19 = 5GP | "Received "Potion"!!"<br /> 20 = 10GP | "Received "Phoenix Down"!!"<br /> 21 = 10GP | "Received "Hyper"!!"<br /> 22 = 10GP | "Received "Tranquilizer"!!"<br /> 23 = 15GP | "Received "Hi-Potion"!!"<br /> 255 = If you lost the race (Nothing)
|-
| style="background: rgb(255,255,204)" | 0x0DC4
| style="background: rgb(255,255,204)" | 16 bytes
| style="background: rgb(255,255,204)" |
Chocobo slot 1 [See Below for [[#Chocobo_Record|Chocobo Slot format]]]
|-
| style="background: rgb(255,255,204)" | 0x0DD4
| style="background: rgb(255,255,204)" | 16 bytes
| style="background: rgb(255,255,204)" | Chocobo slot 2
|-
| style="background: rgb(255,255,204)" | 0x0DE4
| style="background: rgb(255,255,204)" | 16 bytes
| style="background: rgb(255,255,204)" | Chocobo slot 3
|-
| style="background: rgb(255,255,204)" | 0x0DF4
| style="background: rgb(255,255,204)" | 16 bytes
| style="background: rgb(255,255,204)" | Chocobo slot 4 [Slot 5 and 6 are located at 0x1084 - 0x10A3]
|-
| style="background: rgb(255,205,154)" | 0x0E04
| style="background: rgb(255,205,154)" | 13 Bytes
| style="background: rgb(255,205,154)" | z_28 Unknown
|-
| style="background: rgb(255,205,154)" | 0x0E0C<br />z_28[8]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Change on Final Battle<br /><br /> 0x01: <br /> 0x02: <br /> 0x04: <br /> 0x08: Final Battle<br /> 0x10: <br /> 0x20: <br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0E0E<br />z_28[10]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Yuffie Stolen Materia Quest - Disabled party members {YUFY1/YUFI}<br />(Bit mask is set just before stolen materia been restored, to know what chars must be reactivated.)<br /> 0x01: Unused<br /> 0x02: Barret<br /> 0x04: Tifa<br /> 0x08: Red XIII<br /> 0x10: Cait Sith<br /> 0x20: Cid<br /> 0x40: Vincent<br /> 0x80: Aeris<br />
|-
| style="background: rgb(255,205,154)" | 0x0E0F<br />z_28[11]
| style="background: rgb(205,230,230)" | 2 bytes
| style="background: rgb(205,230,230)" | G-Bike Minigame Last Score {GAMES_2/dic}
|-
| style="background: rgb(255,255,204)" | 0x0E11
| style="background: rgb(255,255,204)" | 2 Bytes
| style="background: rgb(255,255,204)" | G-Bike Minigame High Score
|-
| style="background: rgb(255,205,154)" | 0x0E13
| style="background: rgb(255,205,154)" | 1 Byte
| style="background: rgb(255,205,154)" | UnSaved Snowboard Mini Game Temp Var.
|-
| style="background: rgb(255,255,204)" | 0x0E14
| style="background: rgb(255,255,204)" | 4 Bytes
| style="background: rgb(255,255,204)" | Fastest Time For Snowboard Beginner Course. Format: MMSSTTT0 90 27 36 02 in the file is a time of 2'36"279 (value is 32bit int so will become 02362790 when read )
|-
| style="background: rgb(255,255,204)" | 0x0E18
| style="background: rgb(255,255,204)" | 4 Bytes
| style="background: rgb(255,255,204)" | Fastest Time For Snowboard Expert Course. See Beginner Course for more info
|-
| style="background: rgb(255,255,204)" | 0x0E1C
| style="background: rgb(255,255,204)" | 4 Bytes
| style="background: rgb(255,255,204)" | Fastest Time For Snowboard Crazy Course. See Beginner Course for more info
|-
| style="background: rgb(255,255,204)" | 0x0E20
| style="background: rgb(255,255,204)" | 1 Byte
| style="background: rgb(255,255,204)" | HighScore For Snowboard Beginner Course
|-
| style="background: rgb(255,255,204)" | 0x0E21
| style="background: rgb(255,255,204)" | 1 Byte
| style="background: rgb(255,255,204)" | HighScore For Snowboard Expert Course
|-
| style="background: rgb(255,255,204)" | 0x0E22
| style="background: rgb(255,255,204)" | 1 Byte
| style="background: rgb(255,255,204)" | HighScore For Snowboard Crazy Course
|-
| style="background: rgb(255,205,154)" | 0x0E23
| style="background: rgb(255,205,154)" | 1 Byte
| style="background: rgb(255,205,154)" | UnSaved Snowboard Mini Game Temp Var
|-
| style="background: rgb(255,255,204)" | 0x0E24
| style="background: rgb(255,255,204)" | 2 bytes
| style="background: rgb(255,255,204)" | 2nd rank at RollerCoaster Shooter
|-
| style="background: rgb(255,255,204)" | 0x0E26
| style="background: rgb(255,255,204)" | 2 bytes
| style="background: rgb(255,255,204)" | 3rd rank at RollerCoaster Shooter
|-
| style="background: rgb(255,205,154)" | 0x0E28
| style="background: rgb(255,205,154)" | 17 Bytes
| style="background: rgb(255,205,154)" | z_29 Unknown
|-
| style="background: rgb(255,205,154)" | 0x0E28<br />z_29[0]
| style="background: rgb(205,230,230)" | 1 bytes
| style="background: rgb(205,230,230)" |
Mythril Side Quest/Chocobo Sage Side Quest<br />0x01: Talked to the Weapon Seller about the Keystone, Temple of the Ancients, DIO, etc {zz2/m/s4}<br /> 0x02: Chocobo Sage when he finish all remembering stuff {zz3/dic/s0}<br /> 0x04: Unused<br /> 0x08: Old man: "Large Materia needs high level Materia." {zz1/m1/s1}<br /> 0x10: Mythril given to the Weapon Seller {zz2/m/s1}<br /> 0x20: Chocobo Sage if you ask him "What about that Chocobo?" {zz3/m1/s1}<br /> 0x40: Chocobo Sage every time he remember something new about Chocobos is set to 1, and when you tell that back to Chole reset to 0. {zz3/m1/s1}{FRCYO/kodomo/s1}<br /> 0x80: First time you talk to Chole after meeting Chocobo Sage {FRCYO/kodomo/s1}<br />
|-
| style="background: rgb(255,205,154)" | 0x0E29<br />z_29[1]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Chocobo Sage Side Quest - Progression Variable 01: First time you talk to Chocobo Sage<br /> 02,03,04: About Blue/Green Chocobo<br /> 05: About Black Chocobo<br /> 06,07,08: About Gold Chocobo<br /> 09,10: About Zeio Nuts
|-
| style="background: rgb(255,205,154)" | 0x0E2A<br />z_29[2]
| style="background: rgb(255,255,204)" | 2 bytes
| style="background: rgb(255,255,204)" | Number of battles to reach in order to unlock the next part of the Chocobo breeding tutorial
|-
| style="background: rgb(255,205,154)" | 0x0E2C<br />z_29[4]
| style="background: rgb(205,230,230)" | 1 bytes
| style="background: rgb(205,230,230)" | Chocobo Sage Side Quest - Part of the random number of battles formula<br />
|-
| style="background: rgb(255,205,154)" | 0x0E2D<br />z_29[5]
| style="background: rgb(205,230,230)" | 1 bytes
| style="background: rgb(205,230,230)" | Unused?<br />
|-
| style="background: rgb(255,205,154)" | 0x0E2E<br />z_29[6]
| style="background: rgb(205,230,230)" | 1 bytes
| style="background: rgb(205,230,230)" |
Chocobo Race / Others<br />0x01: Set to 1 the first time you talk to Ester to race and Ride your own Chocobo {crcin_1/esto/s1}<br /> 0x02: Set to 1 just before Chocobo Race Engine be launched {crcin_1/esto/s1}<br /> Set to 0 when you receive the price or lose. {crcin_1/dic/s0}<br /> 0x04: Set to 1 just before your first time race (Ester say "Yeahh but jockeys can't buy tickets.")<br /> Then after been activated the next races (she say: "Good Luck! Take care!") {crcin_1/esto/s1}<br /> 0x08: After beating Mog's House and receive 30GP from the guy {GAMES_2/kabe/s1}<br /> 0x10: If you win 9 races to enter Rank S {crcin_1/esto/s1}<br /> 0x20: If you win 19 races with the same chocobo to receive Sprint Shoes, Cat's Bell, Precious Watch, Chocobracelet, and Counter Attack Materia. {crcin_1/esto/s1}<br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0E2F<br />z_29[7]
| style="background: rgb(205,230,230)" | 1 bytes
| style="background: rgb(205,230,230)" | Chocobo Race - Selected Chocobo Stable Position (0 to 5)<br />
|-
| style="background: rgb(255,205,154)" | 0x0E30<br />z_29[8]
| style="background: rgb(205,230,230)" | 1 bytes
| style="background: rgb(205,230,230)" | Unused?<br />
|-
| style="background: rgb(255,205,154)" | 0x0E2E<br />z_29[6]
| style="background: rgb(205,230,230)" | 1 bytes
| style="background: rgb(205,230,230)" |
Northern Cave<br />0x01: Bottom of Northern Cave talk {las4_0/dic/s0}<br /> 0x02: Set to 1 when you enter the map "las3_3" comming from map "las4_1" {las3_3/dic/s0}<br />
|-
| style="background: rgb(255,205,154)" | 0x0E2F<br />z_29[7]
| style="background: rgb(205,230,230)" | 1 bytes
| style="background: rgb(205,230,230)" |
Northern Cave<br />0x01: Bottom of Northern Cave talk {las4_0/dic/s0}<br /> 0x02: Set to 1 when you enter the map "las3_3" comming from map "las4_1" {las3_3/dic/s0}<br />
|-
| style="background: rgb(255,205,154)" | 0x0E30<br />z_29[8]
| style="background: rgb(205,230,230)" | 1 bytes
| style="background: rgb(205,230,230)" |
Northern Cave - Received items from party in the last talk<br />0x01: Barret {las4_0/ballet/s1}<br /> 0x02: Tifa {las4_0/tifa/s1}<br /> 0x04: RedXIII {las4_0/red/s1}<br /> 0x08: Cid {las4_0/cid/s1}<br /> 0x10: Cait Sith {las4_0/cait/s1}<br /> 0x20: Yuffi {las4_0/yufi/s1}<br /> 0x40: Vincent {las4_0/vincent/s1}<br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0E33<br />z_29[11]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" | Lucrecia's Cave sidequest Progression Variable
|-
| style="background: rgb(255,205,154)" | 0x0E35<br />z_29[13]
| style="background: rgb(255,255,204)" | 2 bytes
| style="background: rgb(255,255,204)" | Lucrecia's Cave sidequest:<br />Number of battles to get past in order to unlock Chaos &amp; Death Penalty
|-
| 0x0E39
| 2 bytes
| 1st rank at RollerCoaster Shooter
|-
| style="background: rgb(255,205,154)" | 0x0E3C
| style="background: rgb(255,205,154)" | 105 Bytes
| style="background: rgb(255,205,154)" | z_30 Unknown
|}

==  Save Memory Bank D/E  ==

{| style="border: 1px solid black; border-collapse: collapse; width: 600px" border="1" cellspacing="1" cellpadding="3" align="center"
|+ '''Table 1: FF7 Save Slot'''
|-
! Offset
! Length
! Description
|-
| 0x0EA4
| 1 byte
| Which game-play Disc is needed
|-
| style="background: rgb(255,205,154)" | 0x0EA5
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
z_31 Tifa's House 0x01: Final Heaven {niv_ti2/piano/s1}<br /> 0x02: Cloud played the piano in the flashback {niv_ti2/molody/s2}<br /> 0x04: Elemental Materia {niv_ti2/piano/s1}<br />
|-
| style="background: rgb(255,205,154)" | 0x0EA6
| style="background: rgb(255,205,154)" | 1 Byte
| style="background: rgb(255,205,154)" | Start Of Bombing Mission (0x14=Yes, 0x56=No)<br />Northern Cave - Progress (TODO: more info) 0x94
|-
| style="background: rgb(255,205,154)" | 0x0EA7
| style="background: rgb(255,205,154)" | 3 bytes
| style="background: rgb(255,205,154)" | z_32 Unknown
|-
| style="background: rgb(255,205,154)" | 0x0EA7<br />z_32[0]
| style="background: rgb(255,205,154)" | 1 bytes
| style="background: rgb(255,205,154)" | Northern Cave - Progress (TODO: more info)
|-
| 0x0EAA
| 2 Bytes
| Step counter. Used in great glacier to count the steps until passing out and resetted whenever you enter it. Value to pass out = 544
|-
| style="background: rgb(255,205,154)" | 0x0EAC
| style="background: rgb(255,205,154)" | 22 bytes
| style="background: rgb(255,205,154)" | z_33 Unknown
|-
| style="background: rgb(255,255,204)" | 0x0EC2
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" | Field pointers mask (hand over party leader's head + red and green arrows)<br />0x00: Inactive<br />0x02: Active
|-
| style="background: rgb(255,205,154)" | 0x0EC3
| style="background: rgb(255,205,154)" | 1 byte
| style="background: rgb(255,205,154)" | z_34 Unknown. <del>If you have max materias in your equipment it is set to non-zero (needs to be confirmed)</del> FALSE! (By Ss4).
|-
| 0x0EC4
| 6 bytes
|
Name of Chocobo 1 ([[FF7/FF_Text|FF Text format]])
|-
| 0x0ECA
| 6 bytes
|
Name of Chocobo 2 ([[FF7/FF_Text|FF Text format]])
|-
| 0x0ED0
| 6 bytes
|
Name of Chocobo 3 ([[FF7/FF_Text|FF Text format]])
|-
| 0x0ED6
| 6 bytes
|
Name of Chocobo 4 ([[FF7/FF_Text|FF Text format]])
|-
| 0x0EDC
| 6 bytes
|
Name of Chocobo 5 ([[FF7/FF_Text|FF Text format]])
|-
| 0x0EE2
| 6 bytes
|
Name of Chocobo 6 ([[FF7/FF_Text|FF Text format]])
|-
| 0x0EE8
| 2 bytes
| Stamina of Chocobo 1
|-
| 0x0EEA
| 2 bytes
| Stamina of Chocobo 2
|-
| 0x0EEC
| 2 bytes
| Stamina of Chocobo 3
|-
| 0x0EEE
| 2 bytes
| Stamina of Chocobo 4
|-
| 0x0EF0
| 2 bytes
| Stamina of Chocobo 5
|-
| 0x0EF2
| 2 bytes
| Stamina of Chocobo 6
|-
| 0x0EF4
| 1 byte
|
Vincent Regularly/Change Submarine Color. (Bit-mask)<br />0x01: <br /> 0x02: <br /> 0x04: Vincent Regulary. Has the character entered the party regularly? Byte value (Yes:[0xFF]; No:[0xFB])(NEEDS TO BE CHECKED)<br /> 0x08: Gray Submarine (bit = 1)/ Red Submarine (bit = 0) (Liked with 0x0EF6[2])<br /> 0x10: <br /> 0x20: <br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0EF5
| style="background: rgb(255,205,154)" | 23 bytes
| style="background: rgb(255,205,154)" | z_35 Unknown
|-
| style="background: rgb(255,205,154)" | 0x0EF6<br />z_35[1]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Vehicle Submarine<br />0x01: <br /> 0x02: <br /> 0x04: Grey Submarine Ignored / Red Submarine bit = 1 (Linked with 0x0EF4[3])<br /> 0x08: <br /> 0x10: <br /> 0x20: <br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0EFD<br />z_35[8]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" | Northern Cave - Yuffie Split up path
|-
| style="background: rgb(255,205,154)" | 0x0EFF<br />z_35[10]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Save flag.<br />0x02: set when we in save (menu or point? please check) and unset when out<br /> Other byte values: 0x10, 0x12, 0x51
|-
| style="background: rgb(255,205,154)" | 0x0F04<br />z_35[22]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" | Northern Cave - Progress (TODO: more info)
|-
| style="background: rgb(255,205,154)" | 0x0F05<br />z_35[23]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" | Northern Cave - Progress (TODO: more info)
|-
| style="background: rgb(255,255,204)" | 0x0F0C
| style="background: rgb(255,255,204)" | 24 bytes
| style="background: rgb(255,255,204)" |
Name of location ([[FF7/FF_Text|FF Text format]])
|-
| style="background: rgb(255,205,154)" | 0x0F24
| style="background: rgb(255,205,154)" | 5 bytes
| style="background: rgb(255,205,154)" | z_36 Unknown
|-
| 0x0F29
| 1 bytes
| Save on the world map - Tutorial seen (To be Checked)<br />0x3B: Seen<br />0x33: Not Seen
|-
| style="background: rgb(255,205,154)" | 0x0F2A
| style="background: rgb(255,205,154)" | 50 bytes
| style="background: rgb(255,205,154)" | z_37 Unknown
|-
| style="background: rgb(255,205,154)" | 0x0F2A<br />z_37[0]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Needs more research. 0x01: <br /> 0x02: <br /> 0x04: Red Submarine Tutorial<br /> 0x08: <br /> 0x10: <br /> 0x20: <br /> 0x40: <br /> 0x80:
|-
| style="background: rgb(255,205,154)" | 0x0F2B<br />z_37[1]
| style="background: rgb(255,255,204)" | 1 bytes
| style="background: rgb(255,255,204)" | 0x20: World map Ruby Weapon form. bit=0: Small Form (before first encounter). bit=1: Big Form (after first encounter).
|-
| style="background: rgb(255,205,154)" | 0x0F3A<br />z_37[16]
| style="background: rgb(255,255,204)" | 1 bytes
| style="background: rgb(255,255,204)" | Rand number between 0,1,2. Is set when you change field map. ex: enter a town.
|-
| style="background: rgb(255,255,204)" | 0x0F5C
| style="background: rgb(255,255,204)" | 3 bytes
| style="background: rgb(255,255,204)" |
Party leader's coordinates on world map:<br /> Party leader X position on the world map (X coord). Value from 0 up to 295000<br />000000: 0x000000<br /> 065535: 0xFFFF00 | 065536: 0x000001<br /> 131071: 0xFFFF01 | 131072: 0x000002<br /> 196607: 0xFFFF02 | 196608: 0x000003<br /> 262143: 0xFFFF03 | 262144: 0x000004<br /> 295000: 0x588004
|-
| style="background: rgb(255,255,204)" | 0x0F5F
| style="background: rgb(255,255,204)" | 1 bytes
| style="background: rgb(255,255,204)" | Party leader viewing direction angle on the world map. Value from 0 up to 255 to cover 0 - 359Â°<br />
|-
| style="background: rgb(255,255,204)" | 0x0F60
| style="background: rgb(255,255,204)" | 3 bytes
| style="background: rgb(255,255,204)" |
Party leader Y position on the world map (Y coord). Value from 1 up to 230000<br />000001: 0x01003C<br /> 065535: 0xFFFF3C | 065536: 0x00003D<br /> 131071: 0xFFFF3D | 131072: 0x00003E<br /> 196607: 0xFFFF3E | 196608: 0x00003F<br /> 230000: 0x70823F
|-
| style="background: rgb(255,255,204)" | 0x0F63
| style="background: rgb(255,255,204)" | 1 bytes
| style="background: rgb(255,255,204)" | Party leader Z altitude on the world map (Z coord). Input value from -128 up to 127 are allowed (0 = Mean Sea Level)
|-
| 0x0F64
| 8 bytes
| Caught Wild Chocobo's coordinates on world map
|-
| 0x0F6C
| 8 bytes
| Tiny Bronco/Chocobo's coordinates on world map
|-
| 0x0F74
| 8 bytes
| Buggy/Highwind's coordinates on world map
|-
| 0x0F7C
| 8 bytes
| Submarine/???'s coordinates on world map
|-
| 0x0F84
| 8 bytes
| Diamond=&gt;Ultimate=&gt;Ruby Weapon's coordinates on world map (ruby is bound To the desert)
|-
| style="background: rgb(255,255,204)" | 0x0F8C
| style="background: rgb(255,255,204)" | 2 bytes
| style="background: rgb(255,255,204)" | 1<sup>st</sup> Snow Pole X Coordinate.
|-
| style="background: rgb(255,255,204)" | 0x0F8E
| style="background: rgb(255,255,204)" | 2 bytes
| style="background: rgb(255,255,204)" | 1<sup>st</sup> Snow Pole Y Coordinate.
|-
| style="background: rgb(255,255,204)" | 0x0F90
| style="background: rgb(255,255,204)" | 2 bytes
| style="background: rgb(255,255,204)" | 2<sup>nd</sup> Snow Pole X Coordinate.
|-
| style="background: rgb(255,255,204)" | 0x0F92
| style="background: rgb(255,255,204)" | 2 bytes
| style="background: rgb(255,255,204)" | 2<sup>nd</sup> Snow Pole Y Coordinate.
|-
| style="background: rgb(255,255,204)" | 0x0F94
| style="background: rgb(255,255,204)" | 2 bytes
| style="background: rgb(255,255,204)" | 3<sup>ed</sup> Snow Pole X Coordinate.
|-
| style="background: rgb(255,255,204)" | 0x0F96
| style="background: rgb(255,255,204)" | 2 bytes
| style="background: rgb(255,255,204)" | 3<sup>ed</sup> Snow Pole Y Coordinate.
|-
| style="background: rgb(255,205,154)" | 0x0F98
| style="background: rgb(255,205,154)" | 12/236 bytes
| style="background: rgb(255,205,154)" | z_38 Unknown[0-11] First 12 bytes of 236 (ENDS AT 0x1083 224 Bytes into next bank)
|-
| style="background: rgb(255,205,154)" | 0x0F9C<br />z_38[4]
| style="background: rgb(255,255,204)" | 1 bytes
| style="background: rgb(255,255,204)" | Angle of the world. The viewing direction of the camera onto the world map. For top-view (ca. 45Â°) this value should be 0.
|-
| style="background: rgb(255,205,154)" | 0x0F9D<br />z_38[5]
| style="background: rgb(255,255,204)" | 1 bytes
| style="background: rgb(255,255,204)" | Top-view (ca. 45Â°). Determines the camera's position.
|-
| style="background: rgb(255,205,154)" | 0x0F9C<br />z_38[4]
| style="background: rgb(255,255,204)" | 2 bytes
| style="background: rgb(255,255,204)" |
Camera angle and rotation of normal world map.<br />00 00 - FF 0F: Map rotation angle. xx yx: if y &gt; 0, y will be changed to 0. (Source: Asa. Data Collision)
|-
| style="background: rgb(255,205,154)" | 0x0F9F<br />z_38[6]
| style="background: rgb(255,255,204)" | 2 bytes
| style="background: rgb(255,255,204)" |
Snow Pole Number/Where address will be overwritten by next pole (cycling 00, 01, 02, 00, 01, 02... )<br />00: 1st pole address<br /> 01: 2nd pole address<br /> 02: 3rd pole address
|-
| style="background: rgb(255,205,154)" | 0x0FA0<br />z_38[8]
| 1 bytes
|
Wild Chocobo Type.<br />Value is set when Chocobo is caught and used after Chocobo is sent to cage.<br /> Index is the byte's value and not the bit-mask.<br /> 0x00: Chocobo not displayed in cage<br /> 0x01: Wonderful<br /> 0x02: Great<br /> 0x03: Good<br /> 0x04: Fair<br /> 0x05: Average<br /> 0x06: Poor<br /> 0x07: Bad<br /> 0x08: Terrible<br /> Over 08 = Choco Billy's rating window not displayed
|-
| style="background: rgb(255,205,154)" | 0x0FA1<br />z_38[9]
| style="background: rgb(255,255,204)" | 1 bytes
| style="background: rgb(255,255,204)" |
Riding Byte.<br />Index is the byte's value and not the bit-mask.<br /> 0x00: On foot.<br /> 0x03: Highwind<br /> 0x04: Wild Chocobo (Liked with 0x0C22[0])<br /> 0x0D: Submarine<br /> 0x13: Chocobo (Liked with 0x0C22[1/7]. 0x0C22: 0x04=Yellow, ..., 0x40=Gold)<br />
|-
| style="background: rgb(255,205,154)" | 0x0FA3<br />z_38[11]
| style="background: rgb(255,205,154)" | 1 bytes
| style="background: rgb(255,205,154)" |
Unknown. It seems this value is mixture of Number of Snow Poles, Party direction and walking steps or coordinates. Value will be ignored when loading slot.
|}

==  Save Memory Bank 7/F  ==

{| style="border: 1px solid black; border-collapse: collapse; width: 600px" border="1" cellspacing="1" cellpadding="3" align="center"
|+ '''Table 1: FF7 Save Slot'''
|-
! Offset
! Length
! Description
|-
| style="background: rgb(255,205,154)" | 0x0FA4
| style="background: rgb(255,205,154)" | 224/236 Bytes
| style="background: rgb(255,205,154)" | Unknown z_38[12-235] Last 224 bytes of 236
|-
| style="background: rgb(255,205,154)" | 0x0FA6<br />z_38[14]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
World map camera &amp; map display<br />Add two values (one from camera, one from map) and set this byte.<br />Camera: Aerial(00); Closeup(20)<br /> Map: Off(80); Small(00); Large(40)
|-
| style="background: rgb(255,205,154)" | 0x0FAB<br />z_38[19]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" | If not 0x00, game crashes
|-
| style="background: rgb(255,205,154)" | 0x0FC4<br />z_38[44]
| 2 bytes
| Fields items mask.<br />0x0001: first potion on MD1STIN.<br />0x0002: second potion on MD1STIN.<br />0x0004: potion at NMKIN3.<br />0x0008: phoenix down on NKMIN1.
|-
| style="background: rgb(255,205,154)" | 0x0FC6<br />z_38[46]
| style="background: rgb(225,236,252)" | 1 byte
| style="background: rgb(225,236,252)" |
Items mask, Chocobo Farm ([[Bit_numbering|LBS]])(applied when you take the item).<br />Bit=0(Item in field), Bit=1(Item taken).<br /> 0x01: Destruct Materia Animation displayed {sininb42/mtr/s3}<br /> 0x02: Destruct Materia {sininb42/mtr/s1}<br /> 0x04: Enemy Skill {blin68_2/mtr/s1} (See 0x0BEF[1])<br /> 0x08: Enemy Skill Animation (Drop after battle) {blin68_2/mtr/s3}<br /> 0x10: Odin Materia {sinin2_1/mtr/s1}<br /> 0x20: Odin Materia Animation displayed {sinin2_1/mtr/s3}<br /> 0x40: Counter Materia {nvdun1/mtr/s1}<br /> 0x80: Magic Plus Materia {sandun_1/mtr/s1}<br />
|-
| style="background: rgb(255,205,154)" | 0x0FF1<br />z_38[89]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" | On Buggy vehicle. Specifies if a character is on a Buggy. Only if a Buggy is present.<br />0x0E: On; 0x0C: Off
|-
| 0x0FF4<br />z_38[92]
| 1 byte
|
Items mask, Mythril Mine ([[Bit_numbering|LBS]])(applied when you take the item).<br />Bit=0(Item in field), Bit=1(Item taken).<br /> 0x01: 4sbwy_6 - Tent<br /> 0x02: 4sbwy_3 - Potion<br /> 0x04: 4sbwy_1 - Ether<br /> 0x08: psdun_3 - Ether<br /> 0x10: psdun_4 - Hi-Potion<br /> 0x20: psdun_4 - Elixir<br /> 0x40: psdun_3 - Long Range materia<br /> 0x80: gnmk - Titan Materia<br />
|-
| 0x0FF5<br />z_38[93]
| 1 byte
|
Items mask, ([[Bit_numbering|LBS]])(applied when you take the item).<br />Bit=0(Item in field), Bit=1(Item taken).<br /> 0x01: elmin2_2 - Ether<br /> 0x02: losin1 - Comet Materia<br /> 0x04: gonjun1 - Deathblow Materia<br /> 0x08: q_4 - Hades Materia<br /> 0x10: q_4 - Outsider<br /> 0x20: q_3 - Escourt Guard<br /> 0x40: q_3 - Conformer<br /> 0x80: q_4 - Spirit Lance<br />
|-
| 0x0FF6<br />z_38[94]
| 1 byte
|
Items mask, ([[Bit_numbering|LBS]])(applied when you take the item).<br />Bit=0(Item in field), Bit=1(Item taken).<br /> 0x01: q_1 - Heaven's Cloud<br /> 0x02: q_3 - Megalixir<br /> 0x04: q_4 - Megalixir<br /> 0x08: losinn - Elixir<br /> 0x10: losin2 - Guard Source<br /> 0x20: losin3 - Magic Source<br /> 0x40: las1_2 las4_0 - Elixir<br /> 0x80: las1_2 las4_0 - Mystle<br />
|-
| style="background: rgb(255,205,154)" | 0x0FF9<br />z_38[97]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Items mask, Kalm ([[Bit_numbering|LBS]])(applied when you take the item).<br />Bit=0(Item in field), Bit=1(Item taken).<br /> 0x01: Hidden Ether in the second floor of a house<br /> 0x02: <br /> 0x04: <br /> 0x08: <br /> 0x10: <br /> 0x20: <br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0FFB<br />z_38[99]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" | Kalm Traveler rewards visibility (each bit set back to 0 when picked up)<br />Guide Book (0x01); Master Command(0x02); Master Magic (0x04); Master Summon (0x08); Gold Chocobo (0x10)
|-
| style="background: rgb(255,205,154)" | 0x0FFC<br />z_38[100]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Items mask, Kalm ([[Bit_numbering|LBS]])(applied when you take the item).<br />Bit=0(Item in field), Bit=1(Item taken).<br /> 0x01: Peacemaker in a house<br /> 0x02: <br /> 0x04: <br /> 0x08: <br /> 0x10: <br /> 0x20: <br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0FFD<br />z_38[101]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Items mask, Kalm ([[Bit_numbering|LBS]])(applied when you take the item).<br />Bit=0(Item in field), Bit=1(Item taken).<br /> 0x01: <br /> 0x02: Hidden Ether from house next to the Inn<br /> 0x04: <br /> 0x08: Guard Source<br /> 0x10: Hidden Ether<br /> 0x20: <br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x0FFE<br />z_38[102]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Items mask, Mythril Mine ([[Bit_numbering|LBS]])(applied when you take the item).<br />Bit=0(Item in field), Bit=1(Item taken).<br /> 0x01: <br /> 0x02: <br /> 0x04: <br /> 0x08: <br /> 0x10: Mind Source<br /> 0x20: Tent<br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x1004<br />z_38[]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" | 1<sup>st</sup> party member char ID in Group 1. Final Boss Battle: Bizarro Sephiroth.<br />
|-
| style="background: rgb(255,205,154)" | 0x1005<br />z_38[]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" | 2<sup>nd</sup> party member char ID in Group 1. Final Boss Battle: Bizarro Sephiroth.<br />
|-
| style="background: rgb(255,205,154)" | 0x1006<br />z_38[]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" | 3<sup>ed</sup> party member char ID in Group 1. Final Boss Battle: Bizarro Sephiroth.<br />
|-
| style="background: rgb(255,205,154)" | 0x1007<br />z_38[]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" | 1<sup>st</sup> party member char ID in Group 2. Final Boss Battle: Bizarro Sephiroth.<br />
|-
| style="background: rgb(255,205,154)" | 0x1008<br />z_38[]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" | 2<sup>nd</sup> party member char ID in Group 2. Final Boss Battle: Bizarro Sephiroth.<br />
|-
| style="background: rgb(255,205,154)" | 0x1009<br />z_38[]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" | 3<sup>ed</sup> party member char ID in Group 2. Final Boss Battle: Bizarro Sephiroth.<br />
|-
| style="background: rgb(255,205,154)" | 0x100A<br />z_38[]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" | 1<sup>st</sup> party member char ID in Group 3. Final Boss Battle: Bizarro Sephiroth.<br />
|-
| style="background: rgb(255,205,154)" | 0x100B<br />z_38[]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" | 2<sup>nd</sup> party member char ID in Group 3. Final Boss Battle: Bizarro Sephiroth.<br />
|-
| style="background: rgb(255,205,154)" | 0x100C<br />z_38[]
| style="background: rgb(254,254,255)" | 1 byte
| style="background: rgb(254,254,255)" | 3<sup>ed</sup> party member char ID in Group 3. Final Boss Battle: Bizarro Sephiroth.<br />
|-
| style="background: rgb(255,205,154)" | 0x101E<br />z_38[134]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" |
Items mask, Junon ([[Bit_numbering|LBS]])(applied when you take the item).<br />Bit=0(Item in field), Bit=1(Item taken).<br /> 0x01: Mind Source<br /> 0x02: Power Source<br /> 0x04: Guard Source<br /> 0x08: <br /> 0x10: 1/35 Soldier<br /> 0x20: Luck Source<br /> 0x40: <br /> 0x80: <br />
|-
| style="background: rgb(255,205,154)" | 0x1030<br />z_38[152]
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" | Field screen rain switch (non-zero to turn on rain effect)
|-
| style="background: rgb(255,255,204)" | 0x1084
| style="background: rgb(255,255,204)" | 16 bytes
| style="background: rgb(255,255,204)" | Chocobo slot 5
|-
| style="background: rgb(255,255,204)" | 0x1094
| style="background: rgb(255,255,204)" | 16 bytes
| style="background: rgb(255,255,204)" | Chocobo slot 6
|}

==  Character Record  ==

{| class="wikitable"
|+ '''Table 2: Character Record'''
|-
! Offset
! Length
! Description
|-
| 0x00
| 1 byte
| Character ID - Ignored If Not Cait / Vincent???
|-
| 0x01
| 1 byte
| Level (1-99)
|-
| 0x02
| 1 byte
| Strength (0-255)
|-
| 0x03
| 1 byte
| Vitality (0-255)
|-
| 0x04
| 1 byte
| Magic (0-255)
|-
| 0x05
| 1 byte
| Spirit (0-255)
|-
| 0x06
| 1 byte
| Dexterity (0-255)
|-
| 0x07
| 1 byte
| Luck (0-255)
|-
| 0x08
| 1 byte
| Strength Bonus (Power Sources used)
|-
| 0x09
| 1 byte
| Vitality Bonus (Guard Sources used)
|-
| 0x0A
| 1 byte
| Magic Bonus (Magic Sources used)
|-
| 0x0B
| 1 byte
| Spirit Bonus (Mind Sources used)
|-
| 0x0C
| 1 byte
| Dexterity Bonus (Speed Sources used)
|-
| 0x0D
| 1 byte
| Luck Bonus (Luck Sources used)
|-
| 0x0E
| 1 byte
| Current limit level (1-4)
|-
| 0x0F
| 1 byte
| Current limit bar (0xFF = limit break)
|-
| 0x10
| 12 bytes
|
Name ([[FF7/FF_Text|FF Text]] format) Game's Naming Boxes Cap you At 9 Chars
|-
| 0x1C
| 1 byte
| Equipped weapon
|-
| 0x1D
| 1 byte
| Equipped armor
|-
| 0x1E
| 1 byte
| Equipped accessory
|-
| 0x1F
| 1 byte
| Character flags - 0x10-Sadness, 0x20-Fury
|-
| 0x20
| 1 byte
| Char order - 0xFF-Normal, 0xFE-Back row
|-
| 0x21
| 1 byte
| Level progress bar (0-63) Games Gui Hides Values &lt;4, 4-63 are visible as "progress"
|-
| 0x22
| 2 bytes
|
Learned limit skills<br />0x0001: Limit Lv. 1-1<br /> 0x0002: Limit Lv. 1-2<br /><small>0x0004: Always 0 (reserved bit or spacer/breaker/end of limit)</small><br /> 0x0008: Limit Lv. 2-1<br /> 0x0010: Limit Lv. 2-2<br /><small>0x0020: Always 0 (reserved bit or spacer/breaker/end of limit)</small><br /> 0x0040: Limit Lv. 3-1<br /> 0x0080: Limit Lv. 3-2<br /><small>0x0100: Always 0 (reserved bit or spacer/breaker/end of limit)</small><br /> 0x0200: Limit Lv. 4<br />
|-
| 0x24
| 2 bytes
| Number of kills
|-
| 0x26
| 2 bytes
| Times limit 1-1 has been used
|-
| 0x28
| 2 bytes
| Times limit 2-1 has been used
|-
| 0x2A
| 2 bytes
| Times limit 3-1 has been used
|-
| 0x2C
| 2 bytes
| Current HP
|-
| 0x2E
| 2 bytes
| Base HP (before materia alterations)
|-
| 0x30
| 2 bytes
| Current MP
|-
| 0x32
| 2 bytes
| Base MP (before materia alterations)
|-
| style="background: rgb(255,255,204)" | 0x34
| style="background: rgb(255,255,204)" | 4 bytes
| style="background: rgb(255,255,204)" | Unknown
|-
| 0x38
| 2 bytes
| Maximum HP (after materia alterations)
|-
| 0x3A
| 2 bytes
| Maximum MP (after materia alterations)
|-
| 0x3C
| 4 bytes
| Current EXP
|-
| 0x40
| 4 bytes
| Weapon materia slot number 1
|-
| 0x44
| 4 bytes
| Weapon materia slot number 2
|-
| 0x48
| 4 bytes
| Weapon materia slot number 3
|-
| 0x4C
| 4 bytes
| Weapon materia slot number 4
|-
| 0x50
| 4 bytes
| Weapon materia slot number 5
|-
| 0x54
| 4 bytes
| Weapon materia slot number 6
|-
| 0x58
| 4 bytes
| Weapon materia slot number 7
|-
| 0x5C
| 4 bytes
| Weapon materia slot number 8
|-
| 0x60
| 4 bytes
| Armor materia slot number 1
|-
| 0x64
| 4 bytes
| Armor materia slot number 2
|-
| 0x68
| 4 bytes
| Armor materia slot number 3
|-
| 0x6C
| 4 bytes
| Armor materia slot number 4
|-
| 0x70
| 4 bytes
| Armor materia slot number 5
|-
| 0x74
| 4 bytes
| Armor materia slot number 6
|-
| 0x78
| 4 bytes
| Armor materia slot number 7
|-
| 0x7C
| 4 bytes
| Armor materia slot number 8
|-
| 0x80
| 4 bytes
| EXP to next level
|}

==  Chocobo Record  ==

{| class="wikitable"
|+ '''Table 3: Chocobo Record'''
|-
! Offset
! Length
! Description
|-
| 0x0
| 2 bytes
| Sprint Speed
|-
| 0x2
| 2 bytes
| Max Sprint Speed
|-
| 0x4
| 2 bytes
| Speed
|-
| 0x6
| 2 bytes
| Max Speed
|-
| 0x8
| 1 byte
| Acceleration
|-
| 0x9
| 1 byte
| Cooperation
|-
| 0xA
| 1 byte
| Intelligence
|-
| 0xB
| 1 byte
| Personality
|-
| style="background: rgb(255,255,204)" | 0xC
| style="background: rgb(255,255,204)" | 1 byte
| style="background: rgb(255,255,204)" | Pcount (?)
|-
| 0xD
| 1 byte
| Number of races won
|-
| 0xE
| 1 byte
| 1: female)
|-
| 0xF
| 1 byte
| Type (Yellow, Green, Blue, Black, Gold)
|}

==  Save Item List  ==

Each item in the item list is stored as a word value with the quantity, expressed as a 7-bit value, concatenated with the item's index, expressed as a 9-bit value between the range of 0-320. In Binary: QQQQQQQXXXXXXXXX Where X is the index and Q is the quantity. There are a total of 320 item slots in the save map and a total of 320 objects that are stored there, some of which are dummy items. The objects are indexed like this:<br /> Indexes 0 - 127: Items<br /> Indexes 128 - 255: Weapons<br /> Indexes 256 - 287: Armors<br /> Indexes 288 - 319: Accessories<br /> Quantity is limited (by the menu mechanics) to 99 since there are only two characters available in the item menu to show quantity. A Graphical "glitch" occurs in the ten's digit when quantity exceeds that number. The menu only checks the current quantity to determine if the value can increase and the quantity will not decrease unless an item is used or sold. Forcing the quantity to exceed 99 does not have any side effect with most versions of the game. The Japanese PSX version(BISLPS-00700) is the only version with a problem when you exceed a quantity of 99 for an item. This version will experience an error during battles when you have more then 99 of an item.

==  Save Materia List  ==

Materia is stored as a single-byte ID followed by the amount of AP on that instance of Materia stored as an unsigned 24-bit integer.eskill materia does not use the ap value, but instead the 24 bits as switches for each skill that can be learned. For every materia ap =0xFFFFFF when mastered

{| class="wikitable"
|+ '''Table 1: Materia List (PC)'''
|-
! ID
! Name
! Type
|-
| 0x00
| MP Plus
| Independent
|-
| 0x01
| HP Plus
| Independent
|-
| 0x02
| Speed Plus
| Independent
|-
| 0x03
| Magic Plus
| Independent
|-
| 0x04
| Luck Plus
| Independent
|-
| 0x05
| EXP Plus
| Independent
|-
| 0x06
| Gil Plus
| Independent
|-
| 0x07
| Enemy Away
| Independent
|-
| 0x08
| Enemy Lure
| Independent
|-
| 0x09
| Chocobo Lure
| Independent
|-
| 0x0B
| Long Range
| Independent
|-
| 0x0C
| Mega All
| Independent
|-
| 0x0D
| Counter Attack
| Independent
|-
| 0x0E
| Slash-All
| Command
|-
| 0x0F
| Double Cut
| Command
|-
| 0x0A
| Pre-emptive
| Independent
|-
| 0x10
| Cover
| Independent
|-
| 0x11
| Underwater
| Independent
|-
| 0x12
| HP &lt;-&gt; MP
| Independent
|-
| 0x13
| W-Magic
| Command
|-
| 0x14
| W-Summon
| Command
|-
| 0x15
| W-Item
| Command
|-
| 0x16
| Unknown
| Placeholder?
|-
| 0x17
| All
| Support
|-
| 0x18
| Counter
| Support
|-
| 0x19
| Magic Counter
| Support
|-
| 0x1A
| MP Turbo
| Support
|-
| 0x1B
| MP Absorb
| Support
|-
| 0x1C
| HP Absorb
| Support
|-
| 0x1D
| Elemental
| Support
|-
| 0x1E
| Added Effect
| Support
|-
| 0x1F
| Sneak Attack
| Support
|-
| 0x20
| Final Attack
| Support
|-
| 0x21
| Added Cut
| Support
|-
| 0x22
| Steal As Well
| Support
|-
| 0x23
| Quadra Magic
| Support
|-
| 0x24
| Steal
| Command
|-
| 0x25
| Sense
| Command
|-
| 0x26
| Unknown
| Placeholder?
|-
| 0x27
| Throw
| Command
|-
| 0x28
| Morph
| Command
|-
| 0x29
| Deathblow
| Command
|-
| 0x2A
| Manipulate
| Command
|-
| 0x2B
| Mime
| Command
|-
| 0x2C
| Enemy Skill
| Command
|-
| 0x2D
| Unknown
| Placeholder?
|-
| 0x2E
| Unknown
| Placeholder?
|-
| 0x2F
| Unknown
| Placeholder?
|-
| 0x30
| Master Command
| Command
|-
| 0x31
| Fire
| Magic
|-
| 0x32
| Ice
| Magic
|-
| 0x33
| Earth
| Magic
|-
| 0x34
| Lightning
| Magic
|-
| 0x35
| Restore
| Magic
|-
| 0x36
| Heal
| Magic
|-
| 0x37
| Revive
| Magic
|-
| 0x38
| Seal
| Magic
|-
| 0x39
| Mystify
| Magic
|-
| 0x3A
| Transform
| Magic
|-
| 0x3B
| Exit
| Magic
|-
| 0x3C
| Poison
| Magic
|-
| 0x3D
| Demi
| Magic
|-
| 0x3E
| Barrier
| Magic
|-
| 0x3F
| Unknown
| Placeholder?
|-
| 0x40
| Comet
| Magic
|-
| 0x41
| Time
| Magic
|-
| 0x42
| Unknown
| Placeholder?
|-
| 0x43
| Unknown
| Placeholder?
|-
| 0x44
| Destruct
| Magic
|-
| 0x45
| Contain
| Magic
|-
| 0x46
| FullCure
| Magic
|-
| 0x47
| Shield
| Magic
|-
| 0x48
| Ultima
| Magic
|-
| 0x49
| Master Magic
| Magic
|-
| 0x4A
| Choco/Mog
| Summon
|-
| 0x4B
| Shiva
| Summon
|-
| 0x4C
| Ifrit
| Summon
|-
| 0x4D
| Ramuh
| Summon
|-
| 0x4E
| Titan
| Summon
|-
| 0x4F
| Odin
| Summon
|-
| 0x50
| Leviathan
| Summon
|-
| 0x51
| Bahamut
| Summon
|-
| 0x52
| Kujata
| Summon
|-
| 0x53
| Alexander
| Summon
|-
| 0x54
| Phoenix
| Summon
|-
| 0x55
| Neo Bahamut
| Summon
|-
| 0x56
| Hades
| Summon
|-
| 0x57
| Typhoon
| Summon
|-
| 0x58
| Bahamut ZERO
| Summon
|-
| 0x59
| Knights of Round
| Summon
|-
| 0x5A
| Master Summon
| Summon
|-
| 0xFF
| Empty Slot
| NONE
|}

== Key Item List ==

Key Items are stored in Bank 1 of the Savemap, one bit for each item. Bit ON - party has the item.

{| class="wikitable"
|+ '''Table 1: Key Items List'''
|-
! Variable
! Description
|-
| 0x0BE4<br>Var 64
|
0x01: Cotton Dress<br /> 0x02: Satin Dress<br /> 0x04: Silk Dress<br /> 0x08: Wig<br /> 0x10: Dyed Wig<br /> 0x20: Blonde Wig<br /> 0x40: Glass Tiara<br /> 0x80: Ruby Tiara
|-
| 0x0BE5<br>Var 65
|
0x01: Diamond Tiara<br /> 0x02: Cologne<br /> 0x04: Flower cologne<br /> 0x08: Sexy Cologne<br /> 0x10: Member's Card<br /> 0x20: Lingerie<br /> 0x40: Mystery panties<br /> 0x80: Bikini briefs
|-
| 0x0BE6<br>Var 66
|
0x01: Pharmacy Coupon<br /> 0x02: Disinfectant<br /> 0x04: Deodorant<br /> 0x08: Digestive<br /> 0x10: Huge Materia (Fort Condor)<br /> 0x20: Huge Materia (Corel)<br /> 0x40: Huge Materia (Underwater)<br /> 0x80: Huge Materia (rocket)
|-
| 0x0BE7<br>Var 67
|
0x01: Key to Ancients<br /> 0x02: Letter to a Daughter<br /> 0x04: Letter to a Wife<br /> 0x08: Lunar Harp<br /> 0x10: Basement Key<br /> 0x20: Key to Sector 5<br /> 0x40: Keycard 60<br /> 0x80: Keycard 62
|-
| 0x0BE8<br>Var 68
|
0x01: Keycard 65<br /> 0x02: Keycard 66<br /> 0x04: Keycard 68<br /> 0x08: Midgar parts<br /> 0x10: Midgar parts<br /> 0x20: Midgar parts<br /> 0x40: Midgar parts<br /> 0x80: Midgar parts
|-
| 0x0BE9<br>Var 69
|
0x01: PHS<br /> 0x02: Gold Ticket<br /> 0x04: Keystone<br /> 0x08: Leviathan Scales<br /> 0x10: Glacier Map<br /> 0x20: A Coupon<br /> 0x40: B Coupon<br /> 0x80: C Coupon
|-
| 0x0BEA<br>Var 70
|
0x01: Black Materia<br /> 0x02: Mythril<br /> 0x04: Snowboard
|}

==  KERNEL.BIN Section 4 Entry  ==

During game initialization, section 4 from KERNEL.BIN is decompressed and copied into RAM. This is all the initial values and structure for most of the Save, excluding the header data and the tail of the last bank (0x0054 to 0x0B93).

==  Documentation Notes &amp; Format  ==

Format: Bit mask: Bit description [Hex byte value] {Field Keyword}<br /> Example: 0x04: Set to 1 if we choose no drink when talking to tifa. [0x0F] {MDS7PB_1}<br />

Bit mask: Is the bit position number in hex. Bit7(0x80)|Bit6(0x40)|Bit5(0x20)|Bit4(0x10)|Bit3(0x08)|Bit2(0x04)|Bit1(0x02)|Bit0(0x01)

Note: We use [[Bit_numbering|LBS 0]] bit numbering.

Bit description: What bit does.

Hex byte value: The Byte's value in hex when the bit change.(optional)

Field Keyword: Field name code.
