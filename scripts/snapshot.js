/*jslint browser: true*/
/*global define*/
'use strict';

define([
  'three',
  'underscore',
  'jquery',
  'navArrowsHud',
  'renderer'
], function(
  THREE,
  _,
  jQuery,
  NavArrowsHud,
  Renderer
) {
   
  var $bravaisLatticeInp = jQuery('#bravaisLattice');
  var logo;
  var myHud  = NavArrowsHud.getInstance();
  var theRenderer;

  function Snapshot(renderer) {
      
    theRenderer = renderer;

    var texture = THREE.ImageUtils.loadTexture('Images/logo.png');
     
    logo = new THREE.Mesh( new THREE.PlaneBufferGeometry(200,200 ), new THREE.MeshBasicMaterial( {map: texture, color:0xFAFFFF} )); 
    logo.visible = false;
    logo.name="logo";
    myHud.add(logo);

    /*document.getElementById('download').addEventListener('click', function() {
      addLogo();
      downloadCanvas(this , $bravaisLatticeInp.val());
      removeLogo();
    }, false);*/
        
  };
  
  function downloadCanvas(link,  filename) {
    theRenderer.renderer.clear();
    theRenderer.renderer.render( theRenderer.scene, theRenderer.cameras[0] );
    link.href = document.getElementsByTagName("canvas")[0].toDataURL( ); 
    link.download = filename; 
  };

  function addLogo(){
      var width = jQuery('#app-container').width();
      var height = jQuery(window).height();
      var logo = myHud.getObjByName( "logo" );
      logo.visible = true;
      logo.position.set(width/2.5,height/2.3, 0);
      //theRenderer.renderHud();
  };
  function removeLogo(){
      var width = jQuery('#app-container').width();
      var height = jQuery(window).height();
      var logo = myHud.getObjByName( "logo" );
      logo.visible = false;
      //theRenderer.renderHud();
  };
  return Snapshot;
});
