#!/usr/bin/env python3
"""Hampden board brochure: editorial print edition, September 25, 2026.
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
c.setSubject('A clear place to start: valuation, options and representation')
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

# COVER: original artwork and property photo, with the personal approach up front.
base(1,'Board advisory')
logo('reference-0.svg',M,30,154)
label('BOARD ADVISORY',412,34,size=7,space=1)
p('September 25, 2026',412,48,156,size=8.5,lead=12,color=MUTED)
label('LINCOLN PARK / CHICAGO',M,91,color=ACCENT)
p('2629 North<br/>Hampden Court',M,107,450,size=43,lead=40,font='Cormorant')
photo(M,204,CW,190,focus=.72)
p('<link href="https://www.zillow.com/homedetails/2629-N-Hampden-Ct-APT-204-Chicago-IL-60614/3726053_zpid/" color="#696269">Property photo: Zillow</link>',M,400,230,size=6.8,lead=9,color=MUTED)
p('Reported: 67 units* / 34 deeded parking spaces / built 1970. *Confirm the 66-parcel / 67-unit discrepancy.',M,411,CW,size=7.2,lead=9,color=MUTED)
label('HOW I WORK',M,427,color=ACCENT)
p('People First. Always.',M,443,CW,size=31,lead=33,font='Cormorant')
p('A building sale is one transaction, but it affects every owner differently. I will work with the board on strategy and offer individual conversations about each owner\'s priorities.',M,489,246,size=10.5,lead=15)
p('Expect clear comparisons, regular updates, and candid recommendations. I will explain which offers deserve consideration, where expectations exceed the evidence, and when the terms do not justify a sale.',M,578,246,size=10.5,lead=15)
p('For residents, we can compare ownership costs with future housing expenses and explore a negotiated lease to stay. For investors, we can assess income, capital needs, and net proceeds, with tax advisors reviewing individual consequences.',322,489,246,size=10.5,lead=15)
p('I plan to partner with a residential agent to help owners who need to move. My experience includes large-scale multifamily transactions and deals across the country; I will remain directly involved.',322,593,246,size=10.5,lead=15)
rect(M,687,CW,44,PAPER)
p('Know the value. Then decide.',M+13,696,273,size=18,lead=20,font='Cormorant')
p('Complimentary valuation.<br/>No commitment to sell.',344,695,205,size=9.5,lead=13,color=MUTED)
c.showPage()

# OPTIONS: two sale choices, with two marketing methods under the full-building sale.
base(2,'The options')
heading('YOUR OPTIONS','Full-building sale first.','Begin with the valuation. If the board later chooses to market the property, a voluntary group sale remains a secondary option.')
line(179)
p('01',M,195,35,size=26,lead=29,font='Cormorant',color=ACCENT)
p('Sell the full building',94,195,474,size=23,lead=28,font='Cormorant')
p('Market the entire property as one transaction, using one of two approaches.',94,231,474,size=10.5,lead=15,color=MUTED)
label('TWO MARKETING APPROACHES',M,266,color=ACCENT)
p('Full public marketing',M,289,246,size=12,lead=16,font='Inter-Semi')
p('List the property publicly, market it broadly, respond to inquiries, and arrange building showings.',M,315,246,size=10.5,lead=15,color=MUTED)
p('Confidential targeted outreach',322,289,246,size=12,lead=16,font='Inter-Semi')
p('Approach selected brokers, buyers, and institutions. Require every participant to sign an NDA/confidentiality agreement before receiving confidential materials. Arrange showings only after confirming serious interest and the buyer\'s financial ability to proceed.',322,315,246,size=10.5,lead=15,color=MUTED)
for x,adv,trade in [
    (M,'Wider exposure and buyer competition.','More public exposure and showing activity.'),
    (322,'A quieter process with controlled access.','A smaller buyer pool may limit competition.')]:
    label('ADVANTAGE',x,458,color=ACCENT)
    p(adv,x,474,246,size=10.4,lead=14.5)
    label('TRADEOFF',x,513,color=ACCENT)
    p(trade,x,529,246,size=10.4,lead=14.5,color=MUTED)
line(577)
p('02',M,591,35,size=26,lead=29,font='Cormorant',color=ACCENT)
p('Secondary option: group sale',94,591,474,size=20,lead=24,font='Cormorant')
p('Package only the units of owners who choose to sell together and market them as one offering. This should be considered after the full-building valuation, not as an equal starting point.',94,627,474,size=10.5,lead=15,color=MUTED)
p('<b>Marketing:</b> Participating sellers agree on public or targeted outreach.',94,681,474,size=10.2,lead=14.5)
p('<b>Approval:</b> Marketing tests the market; it does not itself approve a sale. A full-building sale requires applicable owner approval. A group sale involves participating owners, with counsel reviewing restrictions and governance implications.',M,718,CW,size=8.7,lead=12,color=MUTED)
c.showPage()

# VALUE AND FINANCING: concise decision context, with details available online.
base(3,'Value, ownership costs & financing')
heading('THE DECISION','Value, costs &amp; financing.','Start with the evidence, then consider what the options mean for you.')
p('A supported valuation',M,184,246,size=12,lead=16,font='Inter-Semi')
p('I will prepare a Broker Opinion of Value using income, expenses, condition, capital needs, and market evidence. You will receive a supported range and the assumptions behind it.',M,210,246,size=10.5,lead=15)
p('Continued ownership',M,300,246,size=12,lead=16,font='Inter-Semi')
p('Compare mortgage payments, taxes, insurance, dues, and potential assessments with estimated net proceeds and future housing costs. Separate confirmed obligations from estimates.',M,326,246,size=10.5,lead=15,color=MUTED)
p('If you want to stay',322,184,246,size=12,lead=16,font='Inter-Semi')
p('I can explore a lease with prospective buyers. Accessing equity while staying in familiar surroundings could provide flexibility and fewer direct building responsibilities.',322,210,246,size=10.5,lead=15)
p('Rent, lease length, renewals, and protections must be negotiated. Staying is not guaranteed, renting may not cost less, and a sale gives up ownership and future appreciation. Building costs still influence rent.',322,300,246,size=10.3,lead=14.5,color=MUTED)
line(419)
p('Financing individual units',M,435,CW,size=25,lead=28,font='Cormorant')
p('The lender assesses the building as well as the borrower. An appraisal alone does not establish project eligibility. A full-building buyer\'s financing is evaluated separately.',M,474,CW,size=10.5,lead=15)
label('AUGUST 3, 2026',M,523,color=ACCENT)
p('Fannie Mae Limited Review and Freddie Mac Streamlined Review retired for covered applications. Applicable exceptions remain.',M,541,246,size=10.3,lead=14.5)
label('JANUARY 4, 2027',322,523,color=ACCENT)
p('The standard reserve allocation rises from 10% to 15% of annual budgeted assessment income for covered applications. A qualifying reserve study may support an alternative.',322,541,246,size=10.3,lead=14.5)
p('Unresolved critical repairs can prevent eligibility. Routine maintenance or an assessment alone does not automatically disqualify a project. We will seek a lender review; any alternative-financing comparison should use actual quotes.',M,623,CW,size=10.2,lead=14.5,color=MUTED)
p('Sources: <link href="'+FANNIE+'" color="#8C554A">Fannie Mae LL-2026-03</link> / <link href="'+FREDDIE+'" color="#8C554A">Freddie Mac 2026-C</link> / <link href="'+ELIGIBILITY+'" color="#8C554A">Project eligibility</link>',M,685,CW,size=7.7,lead=10)
p('Reviewed September 25, 2026. No building eligibility determination has been made. The reserve rule does not automatically mean a 15% increase in dues.',M,706,CW,size=8.4,lead=11.5,color=MUTED)
c.showPage()

# TERMS AND REQUEST: fees, five-item checklist, approvals and contact.
base(4,'Commission, records & next steps')
heading('GETTING STARTED','Clear terms. A measured process.')
rect(M,156,CW,92,PAPER)
label('PROPOSED COMMISSION',M+16,169,color=ACCENT)
p('1.25%',M+16,185,165,size=34,lead=35,font='Cormorant')
p('of the final sale price',M+16,223,190,size=9,lead=12)
p('Payable to my brokerage at closing. The fee reflects the scale of the transaction and my interest in a lasting relationship. All compensation is negotiable and subject to written agreement.',277,171,275,size=10.2,lead=14)
p('Buyer-broker compensation',M,270,246,size=11,lead=15,font='Inter-Semi')
p('Any seller-paid buyer-broker fee is additional to my fee. Brokers should state it separately in the offer for negotiation and written agreement.',M,293,246,size=10,lead=14,color=MUTED)
p('Other closing costs',322,270,246,size=11,lead=15,font='Inter-Semi')
p('Transfer taxes, title charges, and legal fees are separate. Title pricing may be reduced for a coordinated multi-unit closing. Actual costs require confirmation.',322,293,246,size=10,lead=14,color=MUTED)
line(365)
p('What I need for the valuation',M,380,CW,size=24,lead=27,font='Cormorant')
items=[
('Expenses','2025 and, ideally, Jan 1-Sept 1, 2026 operating expenses.'),
('Capital improvements','Work completed in the last five years and work planned or needed, with costs if available.'),
('Building ages','Roof, elevator, masonry, windows, and boiler.'),
('Maintenance','Sprinkler updates needed and when the driveway was last paved.'),
('Current rents','Unit numbers and monthly rents from willing owners. No tenant names needed.')]
t=422
for i,(title,body) in enumerate(items,1):
    label(f'0{i}',M,t+2,color=ACCENT,size=8,space=0)
    y=p('<b>'+title+':</b> '+body,M+28,t,CW-28,size=10.2,lead=14)
    t=y+9
p('For lender review: budgets, reserve studies, insurance, minutes, assessment information, inspections, and ownership documents. Full checklist and lending background online.',M,588,CW,size=9.3,lead=13,color=MUTED)
p('<b>Before owner distribution:</b> Confirm the current reserve balance, assessment range, ownership and voting schedule, the 66-parcel / 67-unit discrepancy, and financing requirements. Chicago generally requires at least 85% approval for a full-building sale unless governing documents require more. Management, counsel, and a lender should verify the applicable requirements.',M,625,CW,size=8.8,lead=11.8,color=MUTED)
line(675)
logo('reference-2.svg',M,691,219)
p('Matthew Neistat',319,687,249,size=16.5,lead=19,font='Cormorant')
p('<link href="mailto:matt@theneistatgroup.com" color="#8C554A">matt@theneistatgroup.com</link>',319,713,249,size=9.3,lead=13)
p('<link href="'+SITE+'" color="#8C554A">Full presentation &amp; sources online</link> / <link href="'+CHICAGO+'" color="#8C554A">Chicago Code 13-72-085</link>',M,738,285,size=7,lead=9)
p('Board discussion; not an appraisal or commitment to sell.',339,738,229,size=6.5,lead=9,color=MUTED)
c.showPage()
c.save()
for pn,txt,start,end in checks:
    if end>750:raise RuntimeError(f'Page {pn} text extends too low ({end:.1f}): {txt}')
print(args.output)
print('4 pages. Layout bounds passed.')
