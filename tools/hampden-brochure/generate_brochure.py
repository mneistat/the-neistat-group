#!/usr/bin/env python3
"""Build the print edition of the Hampden board brief.

Requires reportlab, svglib and Pillow. All text is editorially condensed from
the September 21, 2026 board website; do not update underlying claims without
updating the source website and its verification date.
"""
from pathlib import Path
import argparse
import base64
from html.parser import HTMLParser
from io import BytesIO
import re

from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics import renderPDF
from reportlab.lib.utils import ImageReader
from svglib.svglib import svg2rlg
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
ap = argparse.ArgumentParser()
default_root = HERE.parents[1] if HERE.parent.name == 'tools' else ROOT
ap.add_argument('--source', type=Path, default=default_root/'hampden-board-site/index.html')
ap.add_argument('--assets', type=Path, help='Optional folder containing reference-0.svg and reference-1.jpg; otherwise extract embedded images from the source HTML.')
ap.add_argument('--font-dir', type=Path, default=Path('/usr/share/fonts/truetype/dejavu'))
ap.add_argument('--output', type=Path, default=default_root/'hampden-board-site/Hampden-Board-Brochure.pdf')
args = ap.parse_args()
args.output.parent.mkdir(parents=True, exist_ok=True)

class EmbeddedImages(HTMLParser):
    def __init__(self):
        super().__init__(); self.images=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='img' and a.get('src','').startswith('data:image/'):
            header,data=a['src'].split(',',1)
            if ';base64' in header:
                self.images.append((header.split(';')[0][5:],base64.b64decode(data)))

assets={}
if args.assets:
    for name in ['reference-0.svg','reference-1.jpg','reference-2.svg']:
        assets[name]=(args.assets/name).read_bytes()
else:
    parser=EmbeddedImages();parser.feed(args.source.read_text())
    svgs=[data for mime,data in parser.images if mime=='image/svg+xml']
    photos=[data for mime,data in parser.images if mime in ('image/jpeg','image/jpg')]
    if len(svgs)<2 or not photos: raise ValueError('Expected header logo, building photo, and footer logo embedded in source HTML.')
    assets={'reference-0.svg':svgs[0],'reference-1.jpg':photos[0],'reference-2.svg':svgs[-1]}

fonts = args.font_dir
for name, fn in [('Sans','DejaVuSans.ttf'),('Sans-Bold','DejaVuSans-Bold.ttf'),('Serif','DejaVuSerif.ttf'),('Serif-Bold','DejaVuSerif-Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(fonts/fn)))
pdfmetrics.registerFontFamily('Sans', normal='Sans', bold='Sans-Bold', italic='Sans', boldItalic='Sans-Bold')
pdfmetrics.registerFontFamily('Serif', normal='Serif', bold='Serif-Bold', italic='Serif', boldItalic='Serif-Bold')

INK = HexColor('#282523')
MUTED = HexColor('#66615b')
ACCENT = HexColor('#934b40')
CREAM = HexColor('#f8f6f1')
PANEL = HexColor('#eeeae2')
RULE = HexColor('#d5cec2')
W, H = 612, 792
M, CW = 44, 524
SITE='https://hampden-board-site.vercel.app/'
CHICAGO='https://codelibrary.amlegal.com/codes/chicago/latest/chicago_il/0-0-0-2658975'
FANNIE='https://singlefamily.fanniemae.com/media/document/pdf/lender-letter-ll-2026-03-updates-project-standards-property-insurance-requirements'

c = canvas.Canvas(str(args.output), pagesize=(W,H), pageCompression=1)
c.setTitle('2629 North Hampden Court | Board Brochure')
c.setAuthor('Matthew Neistat | The Neistat Group')
c.setSubject('Board discussion: complimentary valuation, records, sale strategies and commission')
checks=[]

def para(text,x,top,width=CW,size=10.6,leading=14.9,color=INK,font='Sans',space=0):
    p=Paragraph(text,ParagraphStyle('p',fontName=font,fontSize=size,leading=leading,textColor=color,spaceAfter=0))
    _,height=p.wrap(width,1000)
    p.drawOn(c,x,H-top-height)
    checks.append((page_no, re.sub('<[^>]+>','',text)[:55], top, top+height))
    return top+height+space

def line(top,x=M,width=CW,color=RULE):
    c.setStrokeColor(color);c.setLineWidth(.6);c.line(x,H-top,x+width,H-top)

def label(text,x,top,color=ACCENT,size=8.2):
    c.saveState()
    c.setFillColor(color);c.setFont('Sans-Bold',size)
    t=c.beginText(x,H-top-size);t.setCharSpace(1.15);t.textOut(text.upper());c.drawText(t)
    c.restoreState()

def rect(x,top,width,height,fill):
    c.setFillColor(fill);c.rect(x,H-top-height,width,height,fill=1,stroke=0)

def logo(fn,x,top,width):
    source=assets[fn]
    embedded=None
    if fn=='reference-2.svg':
        # svglib's PDF renderer drops the alpha mask of nested SVG raster images.
        # Keep the original SVG geometry and embed its original RGBA logo directly.
        match=re.search(rb'<image[^>]+data:image/png;base64,([^\"]+)"[^>]*/>',source)
        if match:
            embedded=base64.b64decode(match.group(1))
            source=source[:match.start()]+source[match.end():]
    d=svg2rlg(BytesIO(source));scale=width/d.width;d.scale(scale,scale)
    renderPDF.draw(d,c,x,H-top-d.height*scale)
    if embedded:
        svgscale=width/1490.92  # SVG source coordinates; svglib converts CSS px to points.
        c.drawImage(ImageReader(BytesIO(embedded)),x+(944-67.081)*svgscale,H-top-(97-29+88)*svgscale,542*svgscale,88*svgscale,mask='auto')

def base(n,section):
    global page_no
    page_no=n
    rect(0,0,W,H,CREAM)
    if n>1:
        label('2629 NORTH HAMPDEN COURT',M,28,color=MUTED,size=7.2)
        c.setFont('Sans',7.3);c.setFillColor(MUTED);c.drawRightString(W-M,H-35,section.upper())
        line(47)
    line(745)
    c.setFont('Sans',7.3);c.setFillColor(MUTED)
    c.drawString(M,H-762,'THE NEISTAT GROUP  /  BOARD DISCUSSION  /  SEPTEMBER 21, 2026')
    c.drawRightString(W-M,H-762,f'{n:02d} / 04')
    c.setFont('Sans',7.3);c.drawString(M,H-775,'hampden-board-site.vercel.app')
    c.linkURL(SITE,(M,12,M+170,25),relative=0)

def title(kicker,heading,sub=None):
    label(kicker,M,68)
    t=para(heading,M,88,size=27,leading=32,font='Serif',space=10)
    if sub:t=para(sub,M,t,size=11,leading=15.5,color=MUTED,space=16)
    return t

def bullet(text,x,top,width,size=10.6):
    c.setFillColor(ACCENT);c.circle(x+2,H-top-6,1.6,fill=1,stroke=0)
    return para(text,x+12,top,width-12,size=size,leading=14.5,space=5)

# PAGE ONE / property and the first decision
base(1,'Overview')
logo('reference-0.svg',M,31,195)
label('BOARD DISCUSSION',397,40,color=MUTED,size=7.1)
label('LINCOLN PARK, CHICAGO',M,100)
para('2629 North<br/>Hampden Court.',M,119,size=33,leading=37,font='Serif')
para('Know the value. Then decide.',M,206,size=18,leading=22,font='Serif',color=ACCENT)

# Crop the source photograph to a panoramic facade view without distorting it.
im=Image.open(BytesIO(assets['reference-1.jpg']))
crop_h=im.width*194/CW
im=im.crop((0,245,im.width,245+crop_h))
photo=BytesIO()
im.convert('RGB').save(photo,format='JPEG',quality=92,optimize=True)
photo.seek(0)
c.drawImage(ImageReader(photo),M,H-449,CW,194,mask='auto',preserveAspectRatio=False)
label('THE PROPERTY',M,458,color=MUTED,size=7)
para('<link href="https://www.zillow.com/homedetails/2629-N-Hampden-Ct-APT-204-Chicago-IL-60614/3726053_zpid/" color="#66615b">Photo: property listing on Zillow</link>',404,457,164,size=7.1,leading=9)
for x,big,small in [(M,'67*','Residential units'),(M+135,'34','Deeded parking spaces'),(M+306,'1970','Reported year built')]:
    para(big,x,478,140,size=22,leading=26,font='Serif')
    para(small,x,507,160,size=8.5,leading=11,color=MUTED)
para('Reported figures are unverified. *Confirm the 66-parcel / 67-unit discrepancy against the declaration.',M,528,CW,size=8.5,leading=12,color=MUTED)
line(565)
label('MY RECOMMENDATION',M,582)
para('Start with a clear valuation.',M,603,size=23,leading=28,font='Serif')
t=para('An offer is the starting point. I will prepare a <b>complimentary Broker Opinion of Value</b> using income, expenses, condition, and market evidence. Then we can compare it with the offer.',M,643,CW,size=11,leading=15.8)
para('<b>No listing agreement is required. You are not obligated to sell.</b>',M,t+12,CW,size=10.7,leading=15,color=ACCENT)
para('Prepared for the association\'s board. For discussion only; not an appraisal or commitment to sell. Timing depends on record availability, strategy, buyer diligence, and approvals. Consult your legal, tax, and lending advisors.',M,706,CW,size=8.2,leading=11,color=MUTED)
c.showPage()

# PAGE TWO / record checklist
base(2,'The information')
t=title('01 / THE INFORMATION','What I need to get started.','Send what you have. Approximate dates are fine; we can fill in gaps together.')

def checklist_item(num,heading,body,top):
    label(num,M,top+1,size=9)
    y=para(heading,M+33,top,CW-33,size=13.1,leading=17,font='Sans-Bold',space=5)
    y=para(body,M+33,y,CW-33,size=11.2,leading=16)
    return y+20

t=checklist_item('01','Expenses',
    '2025 operating expenses and, ideally, January 1-September 1, 2026 expenses.',t)
line(t-5);t+=8
t=checklist_item('02','Capital improvements',
    'Work completed in the last five years and anything planned or needed, with costs if available.',t)
line(t-5);t+=8
t=checklist_item('03','Building ages',
    'Approximate ages of the roof, elevator, masonry, windows, and boiler.',t)
line(t-5);t+=8
t=checklist_item('04','Maintenance',
    'Any sprinkler updates needed and when the driveway was last paved.',t)
line(t-5);t+=8
t=checklist_item('05','Current rents',
    'Unit numbers and monthly rents from owners willing to share. No tenant names needed.',t)

rect(M,650,CW,77,PANEL)
label('WHAT YOU WILL RECEIVE',M+16,662,size=7.5)
para('A complimentary written valuation and comparison with the offer. No listing agreement or obligation to sell.',M+16,679,CW-32,size=10.5,leading=14.5)
c.showPage()

# PAGE THREE / options and process
base(3,'Options and process')
t=title('02 / YOUR OPTIONS','Five paths forward.','Compare the tradeoffs. Choose what fits the owners\' priorities.')

def path(letter,heading,desc,trade,approval,top):
    rect(M,top+2,23,23,ACCENT)
    c.setFillColor(white);c.setFont('Sans-Bold',10.5);c.drawCentredString(M+11.5,H-top-18,letter)
    y=para(heading,M+35,top,CW-35,size=12.6,leading=16.5,font='Sans-Bold',space=4)
    y=para(desc+' <b>Tradeoff:</b> '+trade,M+35,y,CW-35,size=10.5,leading=14.5,space=4)
    y=para('<b>Approval:</b> '+approval,M+35,y,CW-35,size=9.4,leading=13,color=MUTED)
    line(y+11,M+35,CW-35)
    return y+22

t=path('A','Negotiate the existing offer','Continue with the identified buyer.','The price has not been tested competitively.','Full-building sale approval.*',t)
t=path('B','Confidential targeted outreach','Approach selected buyers with confidential financials.','Fewer buyers may limit competition.','Full-building sale approval.*',t)
t=path('C','Broad marketed campaign','Seek wider competition with a public summary and protected financials.','Greater exposure and coordination.','Full-building sale approval.*',t)
t=path('D','Voluntary group sale','Willing owners sell together; sellers agree on exposure.','Price depends on the units included.','Participating owners; counsel reviews restrictions.',t)
t=path('E','Retain ownership','Continue ownership and rental income; no sale marketing.','Ongoing expenses and capital needs.','No sale approval; funding decisions remain.',t)
para('*Counsel must confirm the applicable owner approval. See page 4.',M,t-3,CW,size=8.5,leading=12,color=MUTED)

line(608)
label('03 / THE PROCESS',M,621,size=7.8)
steps=[('01  Gather','Expenses, rents, capital improvements, and building details.'),('02  Review','Compare the offer with value, assumptions, and capital needs.'),('03  Choose','Agree on scope, representation, fees, and outreach.'),('04  Evaluate','Review price and terms. Counsel guides approvals and sale.')]
for i,(h,b) in enumerate(steps):
    x=M+(i%2)*270;top=637+(i//2)*50
    para(h,x,top,250,size=10.3,leading=13,font='Sans-Bold')
    para(b,x,top+15,250,size=10.5,leading=14.5,color=MUTED)
c.showPage()

# PAGE FOUR / compensation and board background
base(4,'Commission and board background')
label('04 / COMMISSION',M,66)
para('1.25%',M,83,150,size=40,leading=46,font='Serif',color=ACCENT)
para('of the final sale price',M,133,190,size=10.5,leading=14.5,font='Sans-Bold')
para('My proposed fee, payable to my brokerage at closing. All brokerage compensation is negotiable and subject to written agreement.',247,88,321,size=10.5,leading=14.5)
t=para('<b>Buyer-broker compensation is additional.</b> Buyer brokers should state their requested compensation separately in the offer. The board can negotiate it with the other terms. Any seller-paid buyer-broker fee requires written agreement.',M,164,CW,size=10.5,leading=14.5,space=9)
t=para('<b>Other closing costs are separate.</b> Transfer taxes follow governing rates and transaction terms; title and legal fees require quotes. A title company may offer reduced pricing for a coordinated multi-unit transaction. No closing-cost estimate is included.',M,t,CW,size=10.5,leading=14.2,space=13)
line(t);t+=15
label('FOR THE BOARD',M,t);t+=20
t=para('Approval and owner rights',M,t,CW,size=15,leading=19,font='Serif',space=6)
t=para('Chicago requires at least <b>85% approval</b> for a full-building sale unless the declaration or bylaws require more. Counsel must confirm voting interests, procedures, and owner protections. Resolve the <b>66-parcel / 67-unit discrepancy</b> before calculating votes or allocating proceeds. A qualifying sale can bind dissenting owners; counsel should explain objection deadlines and applicable appraisal, debt, and relocation protections. <link href="'+CHICAGO+'" color="#934b40">Chicago Municipal Code 13-72-085</link>.',M,t,CW,size=10.5,leading=14.2,space=12)
t=para('Condominium financing changes',M,t,CW,size=15,leading=19,font='Serif',space=6)
t=para('Fannie Mae\'s standards apply to covered loans. A lender must assess this building\'s eligibility.',M,t,CW,size=10.5,leading=14.2,space=6)
for txt in [
    '<b>March 18, 2026:</b> The 50% investment-property concentration limit was removed for established projects using Full Review on investor loans.',
    '<b>July 1, 2026:</b> Covered applications must meet a $50,000 maximum per-unit master-policy deductible for required perils.',
    '<b>August 3, 2026:</b> Limited Review is retired for applications from this date. Reserve-study flexibility requires the highest recommended allocation; baseline funding is not accepted.',
    '<b>January 4, 2027:</b> Full Review\'s standard replacement-reserve allocation rises from 10% to 15%. A qualifying reserve study may support an alternative.'
]:
    t=bullet(txt,M,t,CW,size=10.5)
t=para('<link href="'+FANNIE+'" color="#934b40">Fannie Mae LL-2026-03</link> · Reviewed September 21, 2026. Confirm applicable current requirements with the lender.',M,t,CW,size=8.1,leading=11,space=10)
t=para('<b>Reported figures remain unverified.</b> Prior board materials report $85,000 in reserves, eight owner-occupied units, and $270-$350 monthly assessments; confirm with management. They cite 2025 cash studio sales (MRED/MLS): unit 503 at $142,000; unit 204 at $145,000. Individual unit sales do not establish building value.',M,t,CW,size=10.5,leading=14.2,space=10)
line(t);t+=10
logo('reference-2.svg',M,t+3,200)
para('<b>Matthew Neistat</b> · Investment Sales<br/><link href="mailto:matt@theneistatgroup.com" color="#934b40">matt@theneistatgroup.com</link>',M+230,t,CW-230,size=10.5,leading=14.5)

c.save()
for page,text,start,end in checks:
    if end>735:
        raise RuntimeError(f'Page {page} content exceeds body area ({end:.1f}): {text}')
print(args.output)
print('4 pages generated. Text extent checks passed.')
