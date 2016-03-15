$(document).ready(function(){

	var screenWidth = window.innerWidth;
	var OUTER_MARGIN = 180;
	var contentWidth = screenWidth - OUTER_MARGIN*2;
	var CAROUSEL_IMAGE_MAX_WIDTH = $(".ideas .piece_.image-set").css("width");




	// Piece thumbnails
	$(".piece_.thumbnail").click( function(event){

		// Get image source
		var $imageSource = $(this).attr("src");
		console.log($imageSource); 

		// Create replacement image
		var $nextImage = $('<img class="piece_ image" src="">').attr("src", $imageSource);
		console.log($nextImage); 

		// Add next image to DOM
		var $currImage = $(this).parent().find(".piece_.image");
		$currImage.css("opacity",".5");
		$nextImage.insertAfter($currImage);

		// Perform transition


	});


});