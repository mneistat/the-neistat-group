#!/usr/bin/env python3
"""Hampden board brochure: editorial print edition, October 1, 2026.
Run python3 generate.py --output path/to/brochure.pdf.
Requires reportlab, svglib and Pillow. Assets and fonts are bundled.
"""
from pathlib import Path
from io import BytesIO
import argparse, base64, re
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from reportlab.graphics import renderPDF
from svglib.svglib import svg2rlg

ROOT=Path(__file__).resolve().parent
ap=argparse.ArgumentParser(); ap.add_argument('--output',type=Path,default=ROOT/'Hampden-Board-Brochure.pdf'); ap.add_argument('--site-url',default='https://hampden-board-site.vercel.app/'); args=ap.parse_args()
args.output.parent.mkdir(parents=True,exist_ok=True)
for name,fn in [('Inter','Inter-Regular.ttf'),('Inter-Semi','Inter-SemiBold.ttf'),('Cormorant','CormorantGaramond-SemiBold.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(ROOT/'fonts'/fn)))
pdfmetrics.registerFontFamily('Inter',normal='Inter',bold='Inter-Semi',italic='Inter',boldItalic='Inter-Semi')
W,H=612,792; M=44; CW=524
INK=HexColor('#29242A'); MUTED=HexColor('#696269'); ACCENT=HexColor('#8C554A'); PAPER=HexColor('#F5F2ED'); LINE=HexColor('#DCD5CC')
SITE=args.site_url.rstrip('/')+'/'
FREDDIE='https://guide.freddiemac.com/app/guide/bulletin/2026-C'
ELIGIBILITY='https://selling-guide.fanniemae.com/sel/b4-2.1-03/ineligible-projects'
FANNIE='https://singlefamily.fanniemae.com/media/document/pdf/lender-letter-ll-2026-03-updates-project-standards-property-insurance-requirements'
CHICAGO='https://codelibrary.amlegal.com/codes/chicago/latest/chicago_il/0-0-0-2658975'
c=canvas.Canvas(str(args.output),pagesize=(W,H),pageCompression=1)
c.setTitle('2629 North Hampden Court | Board Brochure')
c.setAuthor('Matthew Neistat | The Neistat Group')
c.setSubject('Building valuation, marketing process and representation')
checks=[];page=0

def rect(x,t,w,h,color):
    c.setFillColor(color);c.rect(x,H-t-h,w,h,stroke=0,fill=1)
def line(t,x=M,w=CW):
    c.setStrokeColor(LINE);c.setLineWidth(.55);c.line(x,H-t,x+w,H-t)
def p(txt,x,t,w=CW,size=10.8,lead=15.2,font='Inter',color=INK):
    q=Paragraph(txt,ParagraphStyle('x',fontName=font,fontSize=size,leading=lead,textColor=color))
    _,h=q.wrap(w,1000);q.drawOn(c,x,H-t-h)
    checks.append((page,re.sub('<[^>]+>','',txt)[:55],t,t+h))
    return t+h

def label(txt,x,t,color=MUTED,size=7.2,space=1.25):
    c.saveState();c.setFillColor(color);c.setFont('Inter-Semi',size)
    q=c.beginText(x,H-t-size);q.setCharSpace(space);q.textOut(txt.upper());c.drawText(q);c.restoreState()

def logo(fn,x,t,w):
    source=(ROOT/'assets'/fn).read_bytes();embedded=None
    if fn=='reference-2.svg':
        m=re.search(rb'<image[^>]+data:image/png;base64,([^\"]+)"[^>]*/>',source)
        if m:embedded=base64.b64decode(m.group(1));source=source[:m.start()]+source[m.end():]
    d=svg2rlg(BytesIO(source));s=w/d.width;d.scale(s,s);renderPDF.draw(d,c,x,H-t-d.height*s)
    if embedded:
        q=w/1490.92
        c.drawImage(ImageReader(BytesIO(embedded)),x+(944-67.081)*q,H-t-(97-29+88)*q,542*q,88*q,mask='auto')

def photo(x,t,w,h,focus=.48):
    im=Image.open(ROOT/'assets/reference-1.jpg').convert('RGB')
    ratio=w/h
    if im.width/im.height>ratio:
        cropw=im.height*ratio;left=(im.width-cropw)*focus;box=(left,0,left+cropw,im.height)
    else:
        croph=im.width/ratio;top=(im.height-croph)*focus;box=(0,top,im.width,top+croph)
    im=im.crop(box)
    b=BytesIO();im.save(b,format='JPEG',quality=94,optimize=True);b.seek(0)
    c.drawImage(ImageReader(b),x,H-t-h,w,h)

def base(n,title):
    global page
    page=n
    rect(0,0,W,H,white)
    if n>1:
        label('2629 NORTH HAMPDEN COURT',M,31,size=7,space=1)
        c.setFont('Inter',7.3);c.setFillColor(MUTED);c.drawRightString(W-M,H-38,title)
        line(53)
    line(754)
    c.setFont('Inter',7.2);c.setFillColor(MUTED)
    c.drawString(M,22,'THE NEISTAT GROUP')
    c.drawRightString(W-M,22,f'{n:02d} / 04')

def heading(kicker,title,sub=None):
    label(kicker,M,84,color=ACCENT)
    t=p(title,M,101,CW,size=35,lead=36,font='Cormorant')
    if sub:t=p(sub,M,t+10,CW,size=11,lead=15.5,color=MUTED)
    return t

# A four-page editorial companion to the approved website.
# Preserve the source-supported copy; use a clear hierarchy and printable margins.

# 01 / THE APPROACH
base(1,'A presentation for the owners')
logo('reference-2.svg',M,33,243)
label('BOARD PRESENTATION',408,35,size=7,space=.9)
p('October 1, 2026',408,50,160,size=8.5,lead=12,color=MUTED)
label('LINCOLN PARK / CHICAGO',M,98,color=ACCENT)
p('2629 North<br/>Hampden Court',M,115,480,size=44,lead=41,font='Cormorant')
photo(M,217,CW,204,focus=.72)
p('<link href="https://www.zillow.com/homedetails/2629-N-Hampden-Ct-APT-204-Chicago-IL-60614/3726053_zpid/" color="#696269">Property photography: Zillow</link>',M,428,240,size=6.7,lead=9,color=MUTED)
label('HOW I WORK',M,456,color=ACCENT)
p('People First. Always.',M,474,CW,size=33,lead=35,font='Cormorant')
p('A building sale is one transaction, but it affects every owner differently. For some, this is home. For others, it is an investment. My work begins with understanding those differences.',M,521,CW,size=11,lead=16)
p('Individual attention',M,580,246,size=11,lead=15,font='Inter-Semi')
p('I will work with the board and offer individual owner conversations. My experience includes large-scale multifamily transactions and deals across the country.',M,604,246,size=10.3,lead=14.5,color=MUTED)
p('Clear recommendations',322,580,246,size=11,lead=15,font='Inter-Semi')
p('Expect candid advice and regular updates. I will explain how offers compare on price, terms, financing, timing, and buyer credibility.',322,604,246,size=10.3,lead=14.5,color=MUTED)
rect(M,687,CW,49,PAPER)
rect(M,687,2,49,ACCENT)
p('Establish the building\'s value.',M+16,699,280,size=18.5,lead=21,font='Cormorant')
p('Complimentary valuation.<br/>A clear marketing process.<br/>Evaluation of offers.',356,694,196,size=9,lead=11.3,color=MUTED)
c.showPage()

# 02 / SALE PATHS AND DECISIONS
base(2,'Sale options & marketing process')
heading('01 / THE SALE OPTIONS','Full-building sale first.','Analyze the property, reach qualified buyers, and evaluate offers for the full building.')
rect(M,184,CW,67,PAPER)
label('PRIMARY PATH',M+17,197,color=ACCENT,size=7.3,space=1)
p('Sell the full building',M+17,213,300,size=23,lead=26,font='Cormorant')
p('One transaction.<br/>Two marketing approaches.',377,205,172,size=10.1,lead=14,color=MUTED)
for x, title, body, advantage, tradeoff in [
 (M,'Full public marketing','List publicly, market broadly, respond to inquiries, and coordinate building showings.','Wider exposure and buyer competition.','More public visibility and showing activity.'),
 (322,'Confidential targeted outreach','Approach selected brokers, buyers, and institutions. Require an NDA/confidentiality agreement before sharing confidential materials. Confirm serious interest and financial ability before showings.','A quieter process with controlled access.','A smaller buyer pool may limit competition.')]:
 line(274,x,246)
 p(title,x,287,246,size=11.5,lead=16,font='Inter-Semi')
 p(body,x,314,246,size=10.3,lead=14.5,color=MUTED)
 label('ADVANTAGE',x,425,color=ACCENT,size=7,space=1)
 p(advantage,x,442,246,size=10.2,lead=14)
 label('TRADEOFF',x,480,color=ACCENT,size=7,space=1)
 p(tradeoff,x,497,246,size=10.2,lead=14,color=MUTED)
line(539)
label('SECONDARY OPTION',M,557,color=ACCENT,size=7.3,space=1)
p('Voluntary group sale',M,574,CW,size=25,lead=28,font='Cormorant')
p('Package only the units of owners who choose to sell together. Pricing depends on the units included; participating sellers agree on public or targeted outreach. Counsel reviews restrictions, governance, and control implications.',M,615,CW,size=10.3,lead=14.5,color=MUTED)
rect(M,669,CW,47,PAPER)
label('THE PROCESS',M+13,679,size=6.8,space=.9)
p('Gather records / Analyze the building / Market the property / Evaluate offers',M+13,696,CW-26,size=9.3,lead=13)
p('Marketing does not approve a sale. Compare offers on price, terms, financing, timing, and buyer credibility; counsel guides required owner approvals.',M,726,CW,size=8,lead=10.5)
c.showPage()

# 03 / FINANCIAL AND PERSONAL CONSEQUENCES
base(3,'Owner priorities, costs & financing')
heading('02 / WHAT THIS MEANS FOR YOU','Different owners. Different priorities.','A useful comparison accounts for the financial and personal consequences.')
p('If this is your home',M,186,246,size=11.5,lead=16,font='Inter-Semi')
p('Compare estimated net proceeds and future housing expenses with mortgage payments, taxes, insurance, dues, and potential assessments.',M,213,246,size=10.5,lead=15,color=MUTED)
p('If this is an investment',322,186,246,size=11.5,lead=16,font='Inter-Semi')
p('Compare rental income, operating costs, future capital contributions, and net proceeds. Review individual tax consequences with your tax advisor.',322,213,246,size=10.5,lead=15,color=MUTED)
rect(M,289,CW,127,PAPER)
label('STAYING OR MOVING',M+16,302,color=ACCENT,size=7.2,space=1)
p('I can explore a lease with prospective buyers for owners who want to remain. Rent, duration, renewals, and protections must be negotiated. Staying is not guaranteed; renting may not cost less. A sale gives up ownership and future appreciation, and building costs still influence rent.',M+16,324,CW-32,size=10.1,lead=14)
p('For owners who relocate, I plan to partner with a residential agent to help find their next home.',M+16,389,CW-32,size=9.6,lead=13,color=MUTED)
p('Ownership costs &amp; unit financing',M,439,CW,size=26,lead=29,font='Cormorant')
p('The lender reviews the building as well as the borrower. An appraisal alone does not establish project eligibility. Full-building buyer financing is evaluated separately.',M,480,CW,size=10.4,lead=14.5,color=MUTED)
for x,date,title,body in [
 (M,'AUGUST 3, 2026','Broader project review','Fannie Mae Limited Review and Freddie Mac Streamlined Review retired for covered applications. Applicable exceptions remain.'),
 (322,'JANUARY 4, 2027','15% reserve standard','The standard rises from 10% to 15% of annual budgeted assessment income for covered applications. A qualifying reserve study may support an alternative.')]:
 line(530,x,246)
 label(date,x,546,color=ACCENT,size=7.3,space=.9)
 p(title,x,565,246,size=11,lead=15,font='Inter-Semi')
 p(body,x,589,246,size=9.8,lead=13.5,color=MUTED)
p('Unresolved critical repairs can prevent eligibility. Maintenance or an assessment alone does not automatically disqualify a project. We will seek a lender review and use actual quotes for financing comparisons. The reserve rule is not an automatic 15% increase in dues.',M,665,CW,size=9.4,lead=13,color=MUTED)
p('Sources: <link href="'+FANNIE+'" color="#8C554A">Fannie Mae LL-2026-03</link> / <link href="'+FREDDIE+'" color="#8C554A">Freddie Mac 2026-C</link> / <link href="'+ELIGIBILITY+'" color="#8C554A">Project eligibility</link>',M,724,CW,size=7.3,lead=10)
p('Source review: September 25, 2026. No building-specific eligibility determination has been made.',M,739,CW,size=6.8,lead=9,color=MUTED)
c.showPage()

# 04 / TERMS AND COMPLETE DATA REQUEST
base(4,'Commission, valuation records & next steps')
heading('03 / CLEAR TERMS','What it costs. What I need.')
rect(M,156,CW,86,PAPER)
label('PROPOSED LISTING COMMISSION',M+16,169,color=ACCENT,size=7,space=1)
p('1.25%',M+16,178,180,size=35,lead=36,font='Cormorant')
p('of the final sale price',M+16,225,194,size=8.5,lead=11)
p('Payable to my brokerage at closing. The fee reflects the scale of the transaction and my interest in a lasting relationship.',294,174,257,size=10.2,lead=14.5)
p('All brokerage compensation is negotiable and subject to written agreement.',294,220,257,size=7.4,lead=10,color=MUTED)
p('Buyer-broker compensation',M,267,246,size=10.8,lead=15,font='Inter-Semi')
p('Buyer brokers should state their requested fee separately in the offer. Any seller-paid buyer-broker compensation is additional to my 1.25% and requires negotiation and written agreement.',M,291,246,size=10,lead=14,color=MUTED)
p('Other closing costs',322,267,246,size=10.8,lead=15,font='Inter-Semi')
p('Transfer taxes, title charges, and legal fees are separate. Coordinated multi-unit closings may qualify for reduced title pricing; actual costs require confirmation.',322,291,246,size=10,lead=14,color=MUTED)
line(362)
p('The valuation checklist',M,380,CW,size=25,lead=28,font='Cormorant')
p('Complimentary initial analysis; no listing agreement required. Provide what is available.',M,418,CW,size=9.3,lead=13,color=MUTED)
items=[
 ('Expenses','2025 and, ideally, January 1-September 1, 2026 operating expenses.'),
 ('Capital improvements','Work completed in the last five years, plus planned or needed work and available costs.'),
 ('Building ages','Roof, elevator, masonry, windows, and boiler.'),
 ('Maintenance','Sprinkler updates needed and when the driveway was last paved.'),
 ('Current rents','Unit numbers and monthly rents from willing owners. No tenant names needed.'),
 ('Current reserves','Reserve balance, statement date, and latest available statement.'),
 ('Ownership / parcels','Unit and parking ownership, parcel numbers, and voting shares. Resolve 66 parcels / 67 units against the declaration.')]
t=450
for i,(title,body) in enumerate(items,1):
 label(f'0{i}',M,t+1,color=ACCENT,size=7.7,space=0)
 y=p('<b>'+title+':</b> '+body,M+26,t,CW-26,size=9.4,lead=12.6)
 t=y+6
p('<b>Supporting records:</b> Budgets, reserve studies, insurance, minutes, assessments, inspections, and ownership documents. Management, counsel, and a lender should confirm building figures, approval requirements, and financing before owner distribution.',M,628,CW,size=8.8,lead=12,color=MUTED)
line(681)
logo('reference-2.svg',M,699,238)
label('PREPARED BY',337,695,size=7,space=1)
p('Matthew Neistat',337,712,231,size=18,lead=21,font='Cormorant')
p('<link href="'+SITE+'" color="#8C554A">Full presentation &amp; sources online</link>',M,738,245,size=7.2,lead=9)
p('Prepared for board discussion; not an appraisal.',303,738,265,size=6.6,lead=9,color=MUTED)
c.showPage()
c.save()
for pn,txt,start,end in checks:
 if end>750:raise RuntimeError(f'Page {pn} text extends too low ({end:.1f}): {txt}')
print(args.output)
print('4 pages. Layout bounds passed.')
