$(document).ready(function(){

	var screenWidth = window.innerWidth;
	var ACTIVE_CLASS = "-active";
	var $html = $("html");
	var breakpoints = {
		phone_small: 320,
		phone: 375,
		phone_big: 480,
		tablet_small: 650,
		tablet: 780,
		desktop_small: 1024,
		desktop: 1366,
		desktop_big: 1440
	};


	/*function print (string) {
		console.log(string);
	}

	function printObj ($obj) {
		print("PRINT OBJECT: "+$obj);
		for(var key in $obj) {
		    print(key + ': ' + $obj[key]);
		}
	}*/

	function print(string, obj = null) {
		if (obj) {
			console.log("-----" + string + "-----");
			console.log(obj);
		}
		else {
			console.log(string);
		}
	}

	/* NAV BAR */

	// Fix the nav bar to the screen while scrolling
	moveScroller();
	
	function moveScroller() {
		var move = function() {
			var st = $(window).scrollTop();
			var ot = $("#nav_anchor").offset().top;
			var s = $("#nav");
			var ww = window.innerWidth;
			/*console.log("st: "+st);
			console.log("ot: "+ot);*/
			if(st > ot) {
				s.css({
					position: "fixed",
					top: "0px"
				});
			} else {
				if(st < ot) {
					s.css({
						position: "absolute",
						top: ot
					});
				}
			}
		};
		$(window).scroll(move);
		move();
	}
 
	/* PIECE CAROUSEL */

	var SWIPE_THRESHOLD = 50; // Determines a swipe vs a tap (swipestatus ignores this)

	// Crossing an image's threshold in the direction of movement changes the active image 
	// Images remain active w/in their thresholds
	var IMAGE_CHANGE_THRESHOLD = Math.min(100, screenWidth*.2); 


	var activeIndex = 0, $activeImage = null, activeFocusPoint = 0, changeActiveImage = false, imageSetCount = 0, 
		startPosition = 0, prevDistance = 0,  initalDirection = null, currDirection;

	// TODO: Ignore images/dotnavs that are already active
	// TODO: Add arrow keyboard control
	// TODO: Add numeric keyboard control (treat it like chrome tabs where 1 = first image, ... , 9 = last image)
	// TODO: There can only be one carousel per Piece right now

	// Activate the first image of each carousel by default
	if(screenWidth > breakpoints.tablet) {
		$(".-carousel .piece_image-set").each( function() {
			activateCarouselIndex($(this), 0);
		});
	}
	else { // On mobile, 
		$(".-carousel").each( function() {
			goToCarouselIndex($(this), 0);
		});
	}
	

	// Add swipe gestures to image-sets
    $(".-carousel .piece_image-set").swipe( {
    	tap:function(event, target) {
    		if ($(target).hasClass("piece_image")) {
		        scrollToCarouselImage($(target));
    		}
    		else if ($(target).closest(".piece_image")) {
    			scrollToCarouselImage($(target).closest(".piece_image"));
    		}
		},
    	swipeStatus: function(event, phase, direction, distance, duration, fingerCount) {

    		var $piece = $(this).closest(".ideas_piece");
    		var $pieceImages = $(this).find(".piece_image");

    		if (phase == "start") {
    			var transformMatrix = $(this).css("-webkit-transform") || $(this).css("-moz-transform") || $(this).css("-ms-transform") || $(this).css("-o-transform") || $(this).css("transform");
    			var matrix = transformMatrix.replace(/[^0-9\-.,]/g, '').split(',');
    			startPosition = parseInt(matrix[12] || matrix[4]);
    			
    			// Initiate variables
    			activeIndex = getCarouselActiveIndex($(this));
    			$activeImage = $pieceImages.eq(activeIndex);
				activeFocusPoint = findImageFocusPoint($piece, $activeImage);
				imageSetCount = $pieceImages.size();
				prevDistance = 0;
				changeActiveImage = false;
				initialDirection = null;
				$(this).swipe("option", "allowPageScroll", "auto");
    			
    		}

    		if (phase == "move") {
    			if (!initialDirection) { // Determine initial direction
    				if (direction == "left" || direction == "right") {
    					initialDirection = "horizontal";
    					$(this).swipe("option", "allowPageScroll", "none"); // Disable scrolling if horizontal
	    			}
	    			else {
	    				initialDirection = "vertical";
	    			}
    			}
    			
    			// Only move the carousel if swipe started as horizontal
    			if (initialDirection == "horizontal" && (direction == "left" || direction == "right")) {
	    			$(this).css("transition-duration", "0ms"); // So carousel doesn't lag
	    		    var currPosition = 0;

	    		    // Determine current swiping direction (TouchSwipe only changes direction if the swipe crosses its start point)
	    		    if (direction == "left") {
	    		    	currDirection = (distance >= prevDistance) ? "left" : "right";
	    		    	currPosition = startPosition - distance;
	    		    } else if (direction == "right") {
	    		    	currDirection = (distance >= prevDistance) ? "right" : "left";
	    		        currPosition = startPosition + distance;
	    		    }
	    		    prevDistance = distance;

	    		    scrollCarousel($(this), currPosition); // Carousel follows the swipe while in motion
	    		    
	    		    // Determine whether to change the active image

	    		    // Currently swiping left; If activeImage's left threshold is passed, go to image on right
	    		    if (currDirection == "left" && activeIndex < imageSetCount-1) { 
	    		    	if (currPosition < (activeFocusPoint - IMAGE_CHANGE_THRESHOLD)) { 
	    		    		activeIndex++; 
	    		    		changeActiveImage = true;
						}
			    	}
			    	// Currently swiping right; If activeImage's right threshold is passed, go to image on left
	    		    else if (currDirection == "right" && activeIndex > 0) {
	    		    	if (currPosition > (activeFocusPoint + IMAGE_CHANGE_THRESHOLD)) { 
	    		    		activeIndex--; 
		    		    	changeActiveImage = true;
	    		    	} 
			    	}

			    	// Activate the new image
			    	if (changeActiveImage) {
			    		activateCarouselIndex($(this), activeIndex); 

			    		// Update variables
			    		changeActiveImage = false;
		    			$activeImage = $pieceImages.eq(activeIndex);
						activeFocusPoint = findImageFocusPoint($piece, $activeImage);
			    	}
			    }


    		} else if (phase == "cancel") {
    		    $(this).css("transition-duration", "0.6s");
    		} else if (phase == "end") {
    			$(this).css("transition-duration", "0.6s");
    			scrollCarousel($(this), activeFocusPoint); // Scroll to the active image's focus point
    		}
    	},
    	triggerOnTouchEnd: true,
    	triggerOnTouchLeave: false,
    	allowPageScroll: "auto",
    	threshold: SWIPE_THRESHOLD

    });

	// Carousel dotnav is clicked
	$(".-carousel .piece_dotnav").click( function(event) {
		var $piece = $(this).closest(".ideas_piece");
		var index = $(this).closest(".piece_dotnav-set").find(".piece_dotnav").index($(this));
		goToCarouselIndex($piece, index);
	});

	function scrollToCarouselImage ($image) {
		var $piece = $image.closest(".ideas_piece");
		var index = $image.closest(".piece_image-set").find(".piece_image").index($image);
		goToCarouselIndex($piece, index);
	}

	// Go to the index of the carousel
	function goToCarouselIndex ($piece, index) {
		var $imageSet = $piece.find(".piece_image-set");
		var $image = $imageSet.find(".piece_image").eq(index);

		activateCarouselIndex ($imageSet, index);

		// Scroll to $image
		scrollCarousel($imageSet, findImageFocusPoint($piece, $image));
	}


	// The position of $imageSet that moves focus to the $image
	function findImageFocusPoint($piece, $image) {
		var leftAnchor = ($piece.width() - $image.outerWidth(false)) / 2;  /* Center-aligned */
		/* var leftAnchor = parseInt( $("#intro").css("margin-left") );  Left-aligned */
		return - $image.position().left + leftAnchor;
	}

	
	// Set clicked image + caption + dotnav as -active at index
	function activateCarouselIndex ($imageSet, index) {
		var $image = $imageSet.find(".piece_image").eq(index);
		var $captionSet = $imageSet.siblings(".piece_caption-set");
		var $caption = $captionSet.find(".piece_info").eq(index);
		var $dotnavSet = $imageSet.siblings(".piece_dotnav-set");
		var $dotnav = $dotnavSet.find(".piece_dotnav").eq(index);

		activateItem($image, ".piece_image");
		activateItem($caption, ".piece_info");
		activateItem($dotnav, ".piece_dotnav");
	}

	// Set $item as only one --active,
	function activateItem ($item, selector) {
		$item.addClass(ACTIVE_CLASS);
		$item.siblings(selector).removeClass(ACTIVE_CLASS);
	}

	function getCarouselActiveIndex ($imageSet) {
		var $activeImage = $imageSet.find(".piece_image."+ACTIVE_CLASS);
		return $activeImage.index();
	}

	// Scroll $imageSet to the specified position
	function scrollCarousel ($imageSet, position) {
		$imageSet.css("transform", "translateX("+position+"px)");
	}

   

   	/* MOBILE */

   	var $navBtn = $(".nav_btn");
   	var $mainContent = $("#main-content");
   	var NAV_OPEN_CLASS = "-js-nav-open";

   	$navBtn.click( function(event) {
   		$html.toggleClass(NAV_OPEN_CLASS);
   	});

   	$mainContent.click( function(event) {
   		$html.removeClass(NAV_OPEN_CLASS);
   	});





});