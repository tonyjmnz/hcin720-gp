# Super Mega Awesome TV Show Tracker (Trademark Pending)

## Introduction
We present the **Super Mega Awesome TV Show Tracker**. A simple
tool that will aid in keeping track of the progress on your favorite
TV Shows. Thought as an ambient display, this gadget provides its user
with a non-intrusive flow of information always available at a glance.

## Build Process
The components are two-fold: hardware and software. By creating an
artifact in the meeting lines of both the physical and virtual worlds,
we're empowering our users with affordances of use and visualization;
providing a clean and intuitive experience.

### Software
While all the visualization is done via hardware, the software
counterpart is tasked with the retrieval and organization of the
pertinent data.

#### Trakt
Using the popular video tracking service [Trakt](http://trakt.tv/),
more specifically their open [API](http://docs.trakt.apiary.io/); we
are able to obtain the progress of important shows for future
visualization.

#### NodeJS Server
While Trakt's API is very useful, some modifications needed to be made
for the information was ready to be visualized. Firstly, the API did
not provide a "progress bar", per se. So, in turn we needed to
traverse all episode plays to get the full watched count, to divide
this, afterwards, by the total aired episodes for a given show. This
task provides us with a big dictionary for each show as a key, and the
progress as a value, values that we can then use for visualization.

One of the main goals of our display is to provide up-to-date
information to its users. To complete this, we execute the
aforementioned processed every 5 seconds, so when the time comes for a
visualization, we are able to provide the most up to date value.

In addition, an update message is sent every other second with values
for each of the visualized shows that, when differ from the one
currently being presented, adjust to match.

### Hardware Design
Since the beginning of our design process, we agreed that we wanted
our display to look as much as a TV as possible. So we designed all of
our parts accordingly. While the outside of this gadget looks like a
TV, the most logical way to display the progress of a TV show is to
emulate a progress bar; so we tried to emulate this behavior using our
show identifier and making it "magically" move throughout the
artifact.

This means that the ambient way that we will be displaying our
information is via the movement of the tags and, consequentially, the
sound emitted by the servo moving it.

Our gadget is made of four basic parts: RFID Tags and reader, servos,
pulleys and an Arduino Uno; all encased in a fully laser cut shell.

#### Components
##### Arduino Uno
An [Arduino Uno](https://www.arduino.cc/en/Main/ArduinoBoardUno) is
the heart of this whole operation. Orchestrating the movements of the
servos when receiving information for the shows, reading and
transferring information from the RFID reader to the NodeJS server;
the Arduino is in charge of everything. Everything.

To achieve this, we crafted a piece of C++ code to coordinate the
servo's movements with the show progress. This code, creates an
organized work flow to our gadget. Initially, when both meters are
empty, we can simply scan a new show to display its progress; however,
when either servo is being used, we then need to scan the show we'd
like to stop tracking in order to "clean" the tracker.

##### RFID Tags/Reader
To represent each show, we designed individualized, representative
tags. These tags have embedded RFID tags in them so that our gadget is
able to identify them as well as we do.

##### Hacked servos
While full rotation servo motors exist, sadly, we do not have any in
stock in our lab, and buying them did not seem like a very fun thing
to do. We, however, did have the powers of Google at our disposal.

Using [this](http://www.instructables.com/id/How-to-Make-a-TowerPro-Micro-Servo-Spin-360/step1/Code/) instructable tutorial, we managed to modify three,
one sadly died in the process of making our display; servo motors to
function as continuous.

##### Laser cut parts
Due to the precision and reliability of a laser cutter, we decided to
use it to make as much parts of our display as possible. Using it to
fabricate everything we needed, from our TV-resembling encasing to the
small ledges that hold the inner items in place, we were able to
fabricate successfully all of our needed parts.

##### Pulleys and belts
Used to move the tag throughout the display, we made use of a set of
pulleys and belts bought from [here](http://www.amazon.com/gp/product/B00ZV1NG86?psc=1&redirect=true&ref_=oh_aui_detailpage_o00_s00). However, since we were in the
need of two sets of pulleys, and our set only provided two, we needed
to make an extra set.

We cut four one inch circles from our set of plywood and attached it
to a freshly cut mounts; finishing by attaching them to the other end
of our display.

## Completed Product
Our finished product is able to display the show progress in an
intuitive and non-obtrusive way.

## Pictures
Please find pictures and videos of our project
[here](https://goo.gl/photos/FCY3eT83QukgnxTx9).
