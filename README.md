#Warpwire Sakai 2.9 Install Instructions

The steps to add the Warpwire Sakai plugin to a Sakai 2.9 instance are as follows:

1. Locate the ```<sakai-installation-location>/webapps/portal-render/vm/<skin>/includeStandardHead.vm``` file in your Sakai instance, where ```<skin>``` is the current skin in use for Sakai – in the default Sakai installation, this is the ‘neoskin’

2. Within the includeStandardHead.vm file, locate the closing ```</head>``` tag, and add the following line immediately preceeding the ```</head>``` tag:

     ```<script type="text/javascript" language="JavaScript" src="/portal/scripts/warpwire.js"></script>```

3. Locate the ```<sakai-installation-location>/webapps/portal-render/vm/<skin>/pda.vm``` file in your Sakai instance, where <skin> is the current skin in use for Sakai – in the default Sakai installation, this is the ‘neoskin’

4. Within the ```pda.vm``` file, locate the closing ```</head>``` tag, and add the following line immediately preceeding the ```</head>``` tag:

     ``` <script type="text/javascript" language="JavaScript" src="/portal/scripts/warpwire.js"></script>```
     
5. Within the ```<tomcat-installation-directory>/sakai``` directory, create a folder named 'portlets', if it does not already exist (Resulting folder location will be ```<tomcat-installation-directory>/sakai/portlets```)

6. Copy the ```IMSBLTIPortlet.xml``` file (located at ```xml/IMSBLTIPortlet.xml``` in the included archive) into the folder from the previous step (```<tomcat-installation- location>/sakai/portlets```). This is the xml configuration file that allows the Warpwire plugin to exist as an LTI tool within your Sakai installation.

7. Replace the ```[[WW_LAUNCH_URL]]```, ```[[WW_SECRET]]```, and ```[[WW_CONSUMER_KEY]]``` within the newly created ```<tomcat-installation-location>/sakai/portlets/IMSBLTIPortlet.xml``` file with the applicable values provided by Warpwire.

8. Copy the 'warpwire.js' file (located at ```js/warpwire.js``` in the included archive) to the applicable location within your Sakai installation (```<sakai-installation-location>/webapps/portal/scripts/warpwire.js```)

9. Copy the ‘warpwire’ directory (located within the ‘plugin’ folder) into the ckextraplugins folder within your Sakai installation (Resulting folder location will be ```<sakai-installation-location>/webapps/library/editor/ckextraplugins/warpwire```).

10. Locate the ```<sakai-installation-location>/webapps/library/editor/ckeditor.launch.js``` file, and add the following line to the ckconfig variable within the file:

     ```warpwireURL: '[[WW_ROOT_DOMAIN]]',```
     
11. Replace the ```[[WW_ROOT_DOMAIN]]``` within the ```<sakai-installation-location>/webapps/library/editor/ckeditor.launch.js``` file with the applicable value provided by Warpwire. An example of the necessary changes is located on line 62 of the file located at ```js/ckeditor.launch.js``` in the included archive.

12. Add ‘warpwire’ to the ```sakai.editor.enableResourceSearch``` array, the extraPlugins variable, and within the addExternal plugin function in the ckeditor.launch.js file (located at ```<sakai-installation-location>/webapps/library/editor/ckeditor.launch.js```). An example of the changes necessary are located in the attached folder on lines 91, 92, 145, and 158 of the file located at ```js/ckeditor.launch.js```.

***Note***: After following the provided steps, a restart of Sakai will be necessary in order for the Warpwire Site Tool to be accessible from within Sakai.
